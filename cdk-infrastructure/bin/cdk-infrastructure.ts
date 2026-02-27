#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkInfrastructureStack } from "../lib/cdk-infrastructure-stack";
import { ExpenseTrackerServices } from "../lib/expense-tracker-services-stack";

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region:
    process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || "us-east-1",
};

const infra = new CdkInfrastructureStack(app, "CdkInfrastructureStack", {
  env,
});
new ExpenseTrackerServices(app, "ExpenseTrackerServicesStack", {
  env,
  infrastructure: infra,
});
