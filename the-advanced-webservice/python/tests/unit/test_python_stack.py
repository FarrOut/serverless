import aws_cdk.assertions as assertions
import pytest

from aws_cdk.assertions import Match

from aws_cdk import (
    Duration,
    App,
    Stack,
    Tags,
    aws_lambda as lambda_,
    aws_rds as rds,
)


from the_advanced_webservice.the_advanced_webservice_stack import (
    TheAdvancedWebserviceStack,
)

test_props = {
    "createvpc": True,
    "vpcAz": 2,
    "createlambda": True,
    "createhostedzone": False,
    "createrdscluster": True,
    "lambdaCodeFilePath": "./function/app.py.zip",
    "runTime": lambda_.Runtime.PYTHON_3_12,
    "databaseEngine": rds.DatabaseClusterEngine.aurora_mysql(
        version=rds.AuroraMysqlEngineVersion.VER_3_06_0
    ),
    "existingDomainName": "xxxxxxx.awsps.myinstance.com",
    # existingHostedZoneId: "XXXXXXXXXXXXXXXX",
    "apiName": "myapi",
    "stageName": "dev",
    "originPath": "/dev",
}


def test_synthesizes_properly():
    app = App()
    stack = TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack")
    template = assertions.Template.from_stack(stack)

    #### creates API Gateway resources with...

    # the expected number of API Gateway APIs
    template.resource_count_is("AWS::ApiGateway::RestApi", 1)

    # the expected number of API Gateway Stages
    template.resource_count_is("AWS::ApiGateway::Stage", 2)

    # the expected number of API Gateway deployments
    template.resource_count_is("AWS::ApiGateway::Deployment", 2)

    #### creates Lambda resources with...

    # the expected number of Lambda functions
    template.resource_count_is("AWS::Lambda::Function", 1)

    #### creates RDS resources with...

    # the expected number of RDS Clusters
    template.resource_count_is("AWS::RDS::DBCluster", 1)

    # the correct properties
    template.has_resource_properties(
        "AWS::RDS::DBCluster",
        {
            "CopyTagsToSnapshot": True,
            "DatabaseName": "demos",
            "Engine": "aurora-mysql",
            "EngineVersion": "8.0.mysql_aurora.3.06.0",
            "Port": 3306,
            "ServerlessV2ScalingConfiguration": {"MaxCapacity": 64, "MinCapacity": 2},
            "StorageEncrypted": True,
            "StorageType": "aurora",
            "VpcSecurityGroupIds": [{"Fn::GetAtt": [Match.anyValue(), "GroupId"]}],
            "MasterUserPassword": Match.anyValue(),
            "MasterUsername": Match.anyValue(),
        },
    )

    # the expected number of RDS instances
    template.resource_count_is("AWS::RDS::DBInstance", 2)

    # the expected number of RDS proxies
    template.resource_count_is("AWS::RDS::DBProxy", 1)

    #### creates VPC resources with
    # the expected number of VPCs
    template.resource_count_is("AWS::EC2::VPC", 1)

    # the correct properties
    template.has_resource_properties(
        "AWS::EC2::VPC",
        {
            "CidrBlock": "10.0.0.0/16",
            "EnableDnsHostnames": True,
            "EnableDnsSupport": True,
            "InstanceTenancy": "default",
            Tags: Match.arrayWith(
                [
                    {
                        "Key": "Name",
                        "Value": "TheAdvancedWebserviceStack/ServerlessApp/testvpc",
                    }
                ]
            ),
        },
    )

    # the expected number of VPC subnets
    template.resource_count_is("AWS::EC2::Subnet", 4)

    #### creates CloudFront resources with

    # the expected number of Distriutions
    template.resource_count_is("AWS::CloudFront::Distribution", 1)
