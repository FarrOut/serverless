import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as rds from 'aws-cdk-lib/aws-rds';
import { TheAdvancedWebserviceStack } from "../lib/the-advanced-webservice-stack";

describe("the stack", () => {

    let test_props = {

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


    test("synthesizes the way we expect", () => {
        const app = new cdk.App();

        const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

        // Prepare the stack for assertions.
        const template = Template.fromStack(stack);

    });


    test('creates the expected number of API Gateways', () => {
        const app = new cdk.App();

        // WHEN
        const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

        // Prepare the stack for assertions.
        const template = Template.fromStack(stack);

        // THEN
        template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });











});


