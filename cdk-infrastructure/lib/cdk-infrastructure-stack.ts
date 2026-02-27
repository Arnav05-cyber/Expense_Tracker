import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as servicediscovery from "aws-cdk-lib/aws-servicediscovery";

export class CdkInfrastructureStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;
  public readonly containerSecurityGroup: ec2.SecurityGroup;
  public readonly serviceDiscoveryNamespace: servicediscovery.PrivateDnsNamespace;
  public readonly publicListener: elbv2.ApplicationListener;
  public readonly albSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC
    this.vpc = new ec2.Vpc(this, "VPC", {
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

    const publicSubnet1 = this.vpc.publicSubnets[0];
    const publicSubnet2 = this.vpc.publicSubnets[1];
    const privateSubnet1 = this.vpc.privateSubnets[0];
    const privateSubnet2 = this.vpc.privateSubnets[1];

    // 2. Security Groups
    this.albSecurityGroup = new ec2.SecurityGroup(
      this,
      "PublicLoadBalancerSG",
      {
        vpc: this.vpc,
        description: "Allow HTTP and HTTPS traffic to the load balancer",
        allowAllOutbound: true,
      },
    );
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "Allow all inbound traffic",
    );

    this.containerSecurityGroup = new ec2.SecurityGroup(
      this,
      "ContainerSecurityGroup",
      {
        vpc: this.vpc,
        description: "Allow HTTP and HTTPS traffic from the load balancer",
        allowAllOutbound: true,
      },
    );
    this.containerSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcpRange(0, 65535),
      "Allow traffic from ALB",
    );

    // 3. Application Load Balancer
    const publicLoadBalancer = new elbv2.ApplicationLoadBalancer(
      this,
      "PublicLoadBalancer",
      {
        vpc: this.vpc,
        internetFacing: true,
        securityGroup: this.albSecurityGroup,
        idleTimeout: cdk.Duration.seconds(30),
        vpcSubnets: {
          subnets: [publicSubnet1, publicSubnet2],
        },
      },
    );

    this.publicListener = publicLoadBalancer.addListener(
      "PublicLoadBalancerListener",
      {
        port: 80,
        protocol: elbv2.ApplicationProtocol.HTTP,
      },
    );

    this.publicListener.addAction("DefaultAction", {
      action: elbv2.ListenerAction.fixedResponse(404, {
        contentType: "text/plain",
        messageBody: "Not Found",
      }),
    });

    // 4. ECS Cluster
    this.cluster = new ecs.Cluster(this, "ExpenseTrackerCluster", {
      vpc: this.vpc,
      clusterName: "ExpenseTrackerCluster",
    });

    // 5. Service Discovery Namespace
    this.serviceDiscoveryNamespace = new servicediscovery.PrivateDnsNamespace(
      this,
      "ServiceDiscoveryNamespace",
      {
        name: "expense-tracker.local",
        vpc: this.vpc,
        description: "Private DNS namespace for Expense Tracker services",
      },
    );

    // 6. Outputs
    new cdk.CfnOutput(this, "ExternalUrl", {
      description: "The url of the external load balancer",
      value: `http://${publicLoadBalancer.loadBalancerDnsName}`,
    });
  }
}
