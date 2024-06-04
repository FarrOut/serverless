from aws_cdk import (
    Duration,
    App,
    Stack,
    Tags,
    aws_lambda as lambda_,
    aws_ec2 as ec2,
    aws_apigateway as apigw,
    aws_rds as rds,
)
from constructs import Construct
from aws_cdk import aws_lambda as lambda_
from aws_cdk import aws_iam as iam


class TheAdvancedWebservice(Construct):

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        create_vpc: bool,
        vpc_az: int,
        create_lambda: bool,
        create_hostedzone: bool,
        create_rdscluster: bool,
        lambda_code_file_path: str,
        run_time: lambda_.Runtime,
        database_engine: rds.DatabaseClusterEngine,
        existing_domain_name: str,
        # existing_hosted_zone_id: str,
        api_name: str,
        stage_name: str,
        origin_path: str,
        vpc_id: str = None,
        function_arn: str = None,
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        if create_vpc:
            vpc = ec2.Vpc(
                self,
                "NewVpc",
                max_azs=vpc_az,
                ip_addresses=ec2.IpAddresses.cidr("10.0.0.0/16"),
            )
        else:
            vpc = ec2.Vpc.from_lookup(self, "ImportedVpc", vpc_id=vpc_id)

        lambda_function = None
        lambda_role = None

        if create_lambda:
            lambda_role = iam.Role(
                self,
                "LambdaExecutionRole",
                assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
                managed_policies=[
                    iam.ManagedPolicy.from_managed_policy_arn(
                        self,
                        "AWSLambdaBasicExecutionRole",
                        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                    ),
                    iam.ManagedPolicy.from_managed_policy_arn(
                        self,
                        "AmazonEC2FullAccess",
                        "arn:aws:iam::aws:policy/service-role/AmazonEC2FullAccess",
                    ),
                ],
            )

            lambda_function = lambda_.Function(
                self,
                "NewLambda",
                runtime=run_time,
                code=lambda_.Code.from_asset(lambda_code_file_path),
                handler="rdsLambda.handler",
                vpc=vpc,
                role=lambda_role,
            )
        else:
            lambda_function = lambda_.Function.from_function_attributes(
                self,
                "ImportedLambda",
                function_arn=function_arn,
                same_environment=True,
            )
