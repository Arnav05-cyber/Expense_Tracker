import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";

export class CdkInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC
    const vpc = new ec2.Vpc(this, "VPC", {
      vpcName: "ExpenseTrackerVPC",
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      enableDnsSupport: true,
      enableDnsHostnames: true,
      maxAzs: 2,
      natGateways: 2,
      subnetConfiguration: [
        {
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "PrivateSubnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });

    // CDK automatically creates Subnets, Internet Gateway, NAT Gateways, Route Tables, and Route Table Associations
    // when using the Vpc construct with the configuration above.

    // Get the generated subnets to use in outputs and other resources if needed
    const publicSubnet1 = vpc.publicSubnets[0];
    const publicSubnet2 = vpc.publicSubnets[1];
    const privateSubnet1 = vpc.privateSubnets[0];
    const privateSubnet2 = vpc.privateSubnets[1];

    // 2. Security Groups
    const publicLoadBalancerSG = new ec2.SecurityGroup(
      this,
      "PublicLoadBalancerSG",
      {
        vpc,
        description: "Allow HTTP and HTTPS traffic to the load balancer",
        allowAllOutbound: true,
      },
    );
    publicLoadBalancerSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "Allow all inbound traffic",
    );

    const containerSecurityGroup = new ec2.SecurityGroup(
      this,
      "ContainerSecurityGroup",
      {
        vpc,
        description: "Allow HTTP and HTTPS traffic from the load balancer",
        allowAllOutbound: true,
      },
    );
    containerSecurityGroup.addIngressRule(
      publicLoadBalancerSG,
      ec2.Port.tcpRange(0, 65535),
      "Allow traffic from ALB",
    );

    // 3. Application Load Balancer
    const publicLoadBalancer = new elbv2.ApplicationLoadBalancer(
      this,
      "PublicLoadBalancer",
      {
        vpc,
        internetFacing: true,
        securityGroup: publicLoadBalancerSG,
        idleTimeout: cdk.Duration.seconds(30),
        vpcSubnets: {
          subnets: [publicSubnet1, publicSubnet2],
        },
      },
    );

    const listener = publicLoadBalancer.addListener(
      "PublicLoadBalancerListener",
      {
        port: 80,
        protocol: elbv2.ApplicationProtocol.HTTP,
      },
    );

    // Dummy Target Group for default action
    listener.addAction("DefaultAction", {
      action: elbv2.ListenerAction.fixedResponse(404, {
        contentType: "text/plain",
        messageBody: "Not Found",
      }),
    });

    // 4. ECS Cluster
    const ecsCluster = new ecs.Cluster(this, "ExpenseTrackerCluster", {
      vpc,
      clusterName: "ExpenseTrackerCluster",
    });

    // 5. Service Discovery Namespace
    const serviceDiscoveryNamespace = new servicediscovery.PrivateDnsNamespace(
      this,
      "ServiceDiscoveryNamespace",
      {
        name: "expense-tracker.local",
        vpc,
        description: "Private DNS namespace for Expense Tracker services",
      },
    );

    // 6. Outputs
    new cdk.CfnOutput(this, "VpcId", {
      description: "The id of the vpc that this stack is deployed in",
      value: vpc.vpcId,
    });

    new cdk.CfnOutput(this, "PublicSubnet1", {
      description:
        "The id of the public subnet 1 that this stack is deployed in",
      value: publicSubnet1.subnetId,
    });

    new cdk.CfnOutput(this, "PublicSubnet2", {
      description:
        "The id of the public subnet 2 that this stack is deployed in",
      value: publicSubnet2.subnetId,
    });

    new cdk.CfnOutput(this, "PrivateSubnet1", {
      description:
        "The id of the private subnet 1 that this stack is deployed in",
      value: privateSubnet1.subnetId,
    });

    new cdk.CfnOutput(this, "PrivateSubnet2", {
      description:
        "The id of the private subnet 2 that this stack is deployed in",
      value: privateSubnet2.subnetId,
    });

    new cdk.CfnOutput(this, "ExternalUrl", {
      description: "The url of the external load balancer",
      value: `http://${publicLoadBalancer.loadBalancerDnsName}`,
    });

    new cdk.CfnOutput(this, "ServiceDiscoveryNamespaceId", {
      description: "The ID of the Service Discovery Namespace",
      value: serviceDiscoveryNamespace.namespaceId,
    });
  }
}
