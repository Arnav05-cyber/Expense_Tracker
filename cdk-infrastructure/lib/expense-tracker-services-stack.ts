import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as path from "path";
import { CdkInfrastructureStack } from "./cdk-infrastructure-stack";

export interface ExpenseTrackerServicesProps extends cdk.StackProps {
  infrastructure: CdkInfrastructureStack;
}

export class ExpenseTrackerServices extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ExpenseTrackerServicesProps,
  ) {
    super(scope, id, props);

    const vpc = props.infrastructure.vpc;
    const cluster = props.infrastructure.cluster;
    const containerSecurityGroup = props.infrastructure.containerSecurityGroup;
    const namespace = props.infrastructure.serviceDiscoveryNamespace;
    const albListener = props.infrastructure.publicListener;

    const privateSubnet1 = vpc.privateSubnets[0];
    const privateSubnet2 = vpc.privateSubnets[1];

    const internalSecurityGroup = new ec2.SecurityGroup(
      this,
      "InternalServicesSG",
      {
        vpc,
        allowAllOutbound: true,
        description: "Allow internal communication between ECS tasks",
      },
    );
    internalSecurityGroup.addIngressRule(
      internalSecurityGroup,
      ec2.Port.allTcp(),
      "Allow internal TCP",
    );
    internalSecurityGroup.addIngressRule(
      containerSecurityGroup,
      ec2.Port.allTcp(),
      "Allow ALB SG traffic to internal apps",
    );

    const combinedSecurityGroups = [
      containerSecurityGroup,
      internalSecurityGroup,
    ];

    const logDriver = ecs.LogDrivers.awsLogs({
      streamPrefix: "ExpenseTracker",
      mode: ecs.AwsLogDriverMode.NON_BLOCKING,
    });

    // Kafka
    const kafkaTaskDef = new ecs.FargateTaskDefinition(this, "KafkaTaskDef", {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });
    kafkaTaskDef.addContainer("KafkaContainer", {
      image: ecs.ContainerImage.fromRegistry("confluentinc/cp-kafka:7.6.0"),
      environment: {
        KAFKA_PROCESS_ROLES: "broker,controller",
        KAFKA_NODE_ID: "1",
        KAFKA_CONTROLLER_QUORUM_VOTERS: "1@localhost:9094",
        KAFKA_LISTENERS: "PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9094",
        KAFKA_ADVERTISED_LISTENERS:
          "PLAINTEXT://kafka.expense-tracker.local:9092",
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP:
          "PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT",
        KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER",
        KAFKA_INTER_BROKER_LISTENER_NAME: "PLAINTEXT",
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: "1",
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: "1",
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: "1",
        CLUSTER_ID: "MkU3OEVBNTcwNTJENDM2Qg",
      },
      portMappings: [{ containerPort: 9092 }],
      logging: logDriver,
    });

    new ecs.FargateService(this, "KafkaService", {
      cluster,
      taskDefinition: kafkaTaskDef,
      desiredCount: 1,
      securityGroups: combinedSecurityGroups,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: { name: "kafka", cloudMapNamespace: namespace },
    });

    // MySQL
    const mysqlTaskDef = new ecs.FargateTaskDefinition(this, "MySQLTaskDef", {
      memoryLimitMiB: 1024,
      cpu: 512,
    });
    mysqlTaskDef.addContainer("MySQLContainer", {
      image: ecs.ContainerImage.fromRegistry("mysql:8.0"),
      environment: { MYSQL_ROOT_PASSWORD: "password" },
      portMappings: [{ containerPort: 3306 }],
      logging: logDriver,
    });

    new ecs.FargateService(this, "MySQLService", {
      cluster,
      taskDefinition: mysqlTaskDef,
      desiredCount: 1,
      securityGroups: combinedSecurityGroups,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: { name: "mysql", cloudMapNamespace: namespace },
    });

    // User Service
    const userTaskDef = new ecs.FargateTaskDefinition(this, "UserTaskDef", {
      memoryLimitMiB: 1024,
      cpu: 512,
    });
    userTaskDef.addContainer("UserContainer", {
      image: ecs.ContainerImage.fromAsset(
        path.join(__dirname, "../../userService"),
        {
          exclude: [
            ".git",
            "build",
            ".gradle",
            ".idea",
            "target",
            "node_modules",
          ],
        },
      ),
      environment: {
        SPRING_DATASOURCE_URL:
          "jdbc:mysql://mysql.expense-tracker.local:3306/userservice",
        SPRING_DATASOURCE_USERNAME: "root",
        SPRING_DATASOURCE_PASSWORD: "password",
        SPRING_KAFKA_BOOTSTRAP_SERVERS: "kafka.expense-tracker.local:9092",
      },
      portMappings: [{ containerPort: 9810 }],
      logging: logDriver,
    });

    new ecs.FargateService(this, "UserService", {
      cluster,
      taskDefinition: userTaskDef,
      desiredCount: 1,
      securityGroups: combinedSecurityGroups,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: { name: "user-service", cloudMapNamespace: namespace },
    });

    // Auth Service
    const authTaskDef = new ecs.FargateTaskDefinition(this, "AuthTaskDef", {
      memoryLimitMiB: 1024,
      cpu: 512,
    });
    authTaskDef.addContainer("AuthContainer", {
      image: ecs.ContainerImage.fromAsset(
        path.join(__dirname, "../../authService"),
        {
          exclude: [
            ".git",
            "build",
            ".gradle",
            ".idea",
            "target",
            "node_modules",
          ],
        },
      ),
      environment: {
        SPRING_DATASOURCE_URL:
          "jdbc:mysql://mysql.expense-tracker.local:3306/authservice",
        SPRING_DATASOURCE_USERNAME: "authuser",
        SPRING_DATASOURCE_PASSWORD: "authpassword",
        SPRING_KAFKA_BOOTSTRAP_SERVERS: "kafka.expense-tracker.local:9092",
      },
      portMappings: [{ containerPort: 9820 }],
      logging: logDriver,
    });

    new ecs.FargateService(this, "AuthService", {
      cluster,
      taskDefinition: authTaskDef,
      desiredCount: 1,
      securityGroups: combinedSecurityGroups,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: { name: "auth-service", cloudMapNamespace: namespace },
    });

    // Expense Service
    const expenseTaskDef = new ecs.FargateTaskDefinition(
      this,
      "ExpenseTaskDef",
      { memoryLimitMiB: 1024, cpu: 512 },
    );
    expenseTaskDef.addContainer("ExpenseContainer", {
      image: ecs.ContainerImage.fromAsset(
        path.join(__dirname, "../../expenseService"),
        {
          exclude: [
            ".git",
            "build",
            ".gradle",
            ".idea",
            "target",
            "node_modules",
          ],
        },
      ),
      environment: {
        SPRING_DATASOURCE_URL:
          "jdbc:mysql://mysql.expense-tracker.local:3306/expenseservice",
        SPRING_DATASOURCE_USERNAME: "root",
        SPRING_DATASOURCE_PASSWORD: "password",
        SPRING_KAFKA_BOOTSTRAP_SERVERS: "kafka.expense-tracker.local:9092",
      },
      portMappings: [{ containerPort: 9830 }],
      logging: logDriver,
    });

    new ecs.FargateService(this, "ExpenseService", {
      cluster,
      taskDefinition: expenseTaskDef,
      desiredCount: 1,
      securityGroups: combinedSecurityGroups,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: {
        name: "expense-service",
        cloudMapNamespace: namespace,
      },
    });

    // DS Service
    const dsTaskDef = new ecs.FargateTaskDefinition(this, "DsTaskDef", {
      memoryLimitMiB: 1024,
      cpu: 512,
    });
    dsTaskDef.addContainer("DsContainer", {
      image: ecs.ContainerImage.fromAsset(
        path.join(__dirname, "../../dsService"),
        { exclude: [".git", "__pycache__", "venv", ".idea", "node_modules"] },
      ),
      environment: {
        FLASK_APP: "app",
        PYTHONUNBUFFERED: "1",
        KAFKA_BOOTSTRAP_SERVERS: "kafka.expense-tracker.local:9092",
        MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "",
      },
      portMappings: [{ containerPort: 8002 }],
      logging: logDriver,
    });

    new ecs.FargateService(this, "DsService", {
      cluster,
      taskDefinition: dsTaskDef,
      desiredCount: 1,
      securityGroups: combinedSecurityGroups,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: { name: "ds-service", cloudMapNamespace: namespace },
    });

    // Kong Gateway
    const kongTaskDef = new ecs.FargateTaskDefinition(this, "KongTaskDef", {
      memoryLimitMiB: 1024,
      cpu: 512,
    });
    const kongContainer = kongTaskDef.addContainer("KongContainer", {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, "../../kong")),
      portMappings: [{ containerPort: 8000 }, { containerPort: 8001 }],
      logging: logDriver,
    });

    const kongService = new ecs.FargateService(this, "KongService", {
      cluster,
      taskDefinition: kongTaskDef,
      desiredCount: 1,
      securityGroups: combinedSecurityGroups,
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      cloudMapOptions: { name: "kong", cloudMapNamespace: namespace },
    });

    // ALB Connection
    albListener.addTargets("KongTarget", {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [
        kongService.loadBalancerTarget({
          containerName: "KongContainer",
          containerPort: 8000,
        }),
      ],
      healthCheck: { path: "/ping" },
    });
  }
}
