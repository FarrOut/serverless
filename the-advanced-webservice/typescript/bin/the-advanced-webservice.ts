#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TheAdvancedWebserviceStack } from '../lib/the-advanced-webservice-stack';

const envEU = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }

const app = new cdk.App();
new TheAdvancedWebserviceStack(app, 'TheAdvancedWebserviceStack', {env: envEU});



