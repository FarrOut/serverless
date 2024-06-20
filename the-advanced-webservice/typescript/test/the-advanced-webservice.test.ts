import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as rds from 'aws-cdk-lib/aws-rds';
import { TheAdvancedWebserviceStack } from "../lib/the-advanced-webservice-stack";
import { Instance } from "aws-cdk-lib/aws-ec2";

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

    describe("creates API Gateway resources with", () => {

        test('the expected number of API Gateway APIs', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
        });
        test('the expected number of API Gateway Stages', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs('AWS::ApiGateway::Stage', 2);
        });
        test('the expected number of API Gateway deployments', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs('AWS::ApiGateway::Deployment', 2);
        });
    });
    describe("creates Lambda resources with", () => {
        test('the expected number of Lambda functions', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs('AWS::Lambda::Function', 1);
        });
    });
    describe("creates RDS resources with", () => {
        test('the expected number of RDS Clusters', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs("AWS::RDS::DBCluster", 1);
        });
        test('the correct properties', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.hasResourceProperties("AWS::RDS::DBCluster", {
                CopyTagsToSnapshot: true,
                DatabaseName: 'demos',
                Engine: "aurora-mysql",
                EngineVersion: "8.0.mysql_aurora.3.06.0",
                Port: 3306,
                ServerlessV2ScalingConfiguration: {
                    "MaxCapacity": 64,
                    "MinCapacity": 2
                },
                StorageEncrypted: true,
                StorageType: "aurora",
                VpcSecurityGroupIds: [
                    {
                        "Fn::GetAtt": [
                            Match.anyValue(),
                            "GroupId"
                        ]
                    }
                ],
                MasterUserPassword: Match.anyValue(),
                MasterUsername: Match.anyValue(),
            });
        });
        test('the expected number of RDS instances', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs("AWS::RDS::DBInstance", 2);
        });
        test('the expected number of RDS proxies', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs("AWS::RDS::DBProxy", 1);
        });
    });
    describe("creates VPC resources with", () => {
        test('the expected number of VPCs', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs("AWS::EC2::VPC", 1);
        });
        test('the correct properties', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.hasResourceProperties("AWS::EC2::VPC", {
                CidrBlock: "10.0.0.0/16",
                EnableDnsHostnames: true,
                EnableDnsSupport: true,
                InstanceTenancy: "default",
                Tags: Match.arrayWith([{ Key: "Name", Value: "TheAdvancedWebserviceStack/ServerlessApp/testvpc" }])
            });
        });
        test('the expected number of VPC subnets', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs("AWS::EC2::Subnet", 4);
        });
    });
    describe("creates CloudFront resources with", () => {
        test('the expected number of Distriutions', () => {
            const app = new cdk.App();

            // WHEN
            const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", test_props);

            // Prepare the stack for assertions.
            const template = Template.fromStack(stack);

            // THEN
            template.resourceCountIs("AWS::CloudFront::Distribution", 1);
        });

    });
});


