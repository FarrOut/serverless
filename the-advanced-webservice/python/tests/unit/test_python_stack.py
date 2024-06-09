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

app = App()
stack = TheAdvancedWebserviceStack(
    app,
    "TheAdvancedWebserviceStack",
    create_vpc=True,
    vpc_az=2,
    create_lambda=True,
    create_hostedzone=False,
    create_rdscluster=True,
    lambda_code_file_path="./function/app.py.zip",
    run_time=lambda_.Runtime.PYTHON_3_12,
    database_engine=rds.DatabaseClusterEngine.aurora_mysql(
        version=rds.AuroraMysqlEngineVersion.VER_3_06_0
    ),
    existing_domain_name="xxxxxxx.awsps.myinstance.com",
    # existing_hosted_zone_id="XXXXXXXXXXXXXXXX",
    api_name="myapi",
    stage_name="dev",
    origin_path="/dev",
)


def test_synthesizes_properly():
    template = assertions.Template.from_stack(stack)

    #### creates API Gateway resources with...


def test_api_gateway():
    template = assertions.Template.from_stack(stack)

    # the expected number of API Gateway APIs
    template.resource_count_is("AWS::ApiGateway::RestApi", 1)

    # the expected number of API Gateway Stages
    template.resource_count_is("AWS::ApiGateway::Stage", 2)

    # the expected number of API Gateway deployments
    template.resource_count_is("AWS::ApiGateway::Deployment", 2)

    #### creates Lambda resources with...


def test_lambda():
    template = assertions.Template.from_stack(stack)

    # the expected number of Lambda functions
    template.resource_count_is("AWS::Lambda::Function", 1)

    #### creates RDS resources with...


def test_rds():
    template = assertions.Template.from_stack(stack)

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
            "VpcSecurityGroupIds": [{"Fn::GetAtt": [Match.any_value(), "GroupId"]}],
            "MasterUserPassword": Match.any_value(),
            "MasterUsername": Match.any_value(),
        },
    )

    # the expected number of RDS instances
    template.resource_count_is("AWS::RDS::DBInstance", 2)

    # the expected number of RDS proxies
    template.resource_count_is("AWS::RDS::DBProxy", 1)


#### creates VPC resources with
def test_vpc():
    template = assertions.Template.from_stack(stack)

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
            "Tags": [
                {
                    "Key": "Name",
                    "Value": "TheAdvancedWebserviceStack/TheAdvancedWebservice/NewVpc",
                }
            ],
        },
    )

    # the expected number of VPC subnets
    template.resource_count_is("AWS::EC2::Subnet", 4)


#### creates CloudFront resources with
def test_cloudfront():
    template = assertions.Template.from_stack(stack)

    # the expected number of Distriutions
    template.resource_count_is("AWS::CloudFront::Distribution", 1)
