#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TheAdvancedWebserviceStack } from '../lib/the-advanced-webservice-stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as rds from 'aws-cdk-lib/aws-rds';
const envEU = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }

const app = new cdk.App();

let props = {
    env: envEU,

    createvpc: true,
    vpcAz: 2,
    createlambda: true,
    createhostedzone: false,
    createrdscluster: true,
    lambdaCodeFilePath: "./function/app.py.zip",
    runTime: lambda.Runtime.PYTHON_3_12,
    databaseEngine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_06_0 }),
    existingDomainName: "xxxxxxx.awsps.myinstance.com",
    // existingHostedZoneId: "XXXXXXXXXXXXXXXX",
    apiName: 'myapi',
    stageName: 'dev',
    originPath: '/dev'
}

new TheAdvancedWebserviceStack(app, 'TheAdvancedWebserviceStack', props);



