#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib';
import { BootstrapStack } from '../lib/bootstrap-stack.js';
import { MainStack } from '../lib/main-stack.js';

const app = new App();

// `exactOptionalPropertyTypes` forbids assigning `string | undefined` to an
// optional `string` field, so omit `account` entirely when unset instead of
// passing it through as `undefined`.
const env = {
  ...(process.env.CDK_DEFAULT_ACCOUNT ? { account: process.env.CDK_DEFAULT_ACCOUNT } : {}),
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

const main = new MainStack(app, 'CoreInfra', {
  stackName: 'CoreInfra',
  env,
  budgetLimitUsd: 10,
  alertEmail: 'cbridewell5@gmail.com',
});

const bootstrap = new BootstrapStack(app, 'CoreInfraBootstrap', {
  stackName: 'CoreInfraBootstrap',
  env,
  githubOwner: 'CrispyCabot',
  githubRepo: 'chrisbridewell-infrastructure',
  githubOwnerId: '18431358',
  githubRepoId: '1336051234',
});

// Per PRACTICES.md: everything in the personal AWS account gets an
// environment tag. This repo currently only ever deploys one environment.
for (const stack of [main, bootstrap]) {
  Tags.of(stack).add('environment', 'prd');
}
