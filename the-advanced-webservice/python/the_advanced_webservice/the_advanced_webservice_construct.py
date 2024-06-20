from aws_cdk import (
    Duration,
    App,
    Stack,
    Tags,
    aws_lambda as lambda_,
    aws_ec2 as ec2,
    aws_cloudfront as cloudfront,
    RemovalPolicy,
    aws_apigateway as apigw,
    aws_logs as logs,
    aws_route53_targets as targets,
    aws_route53 as route53,
    aws_cloudfront_origins as origins,
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
        database_engine: rds.IClusterEngine,
        api_name: str,
        stage_name: str,
        origin_path: str,
        domain_name: str,
        existing_hosted_zone_id: str,
        vpc_id: str = None,
        function_arn: str = None,
        # existing_domain_name: str = None,
        # new_domain_name: str = None,
        # existing_hosted_zone_id: str = None,
        existing_rds_cluster_identifier: str = None,
        record_subdomain_name: str = None,
        create_public_hosted_zone: bool = False,
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        myvpc = None

        if create_vpc:
            myvpc = ec2.Vpc(
                self,
                "NewVpc",
                max_azs=vpc_az,
                ip_addresses=ec2.IpAddresses.cidr("10.0.0.0/16"),
            )
        else:
            myvpc = ec2.Vpc.from_lookup(self, "ImportedVpc", vpc_id=vpc_id)

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
                vpc=myvpc,
                role=lambda_role,
            )
        else:
            lambda_function = lambda_.Function.from_function_attributes(
                self,
                "ImportedLambda",
                function_arn=function_arn,
                same_environment=True,
            )

        myrds = (None,)

        if create_rdscluster:
            subnet_group = rds.SubnetGroup(
                self,
                "MySubnetGroup",
                description="test subnet group",
                vpc=myvpc,
                removal_policy=RemovalPolicy.DESTROY,
                subnet_group_name="subnetGroupName",
                vpc_subnets=ec2.SubnetSelection(
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                ),
            )

            parameter_group = rds.ParameterGroup(
                self,
                "ParameterGroup",
                engine=database_engine,
                parameters={"aws_default_lambda_role": "mylambdaexecutionrole"},
            )

            my_cluster_credentials = rds.DatabaseSecret(
                self, "myrdsscreds", username="ClusterAdmin", secret_name="myrdsscreds"
            )

            myrds = rds.DatabaseCluster(
                self,
                "testauroracluster",
                engine=database_engine,
                default_database_name="demos",
                credentials=rds.Credentials.from_secret(
                    my_cluster_credentials, username="clusteradmin"
                ),
                parameter_group=parameter_group,
                subnet_group=subnet_group,
                storage_encrypted=True,
                port=3306,
                writer=rds.ClusterInstance.serverless_v2("writer"),
                readers=[
                    rds.ClusterInstance.serverless_v2("reader", scale_with_writer=True),
                ],
                serverless_v2_max_capacity=64,
                serverless_v2_min_capacity=2,
                vpc=myvpc,
                storage_type=rds.DBClusterStorageType.AURORA,
            )

            myrds.add_rotation_single_user(
                automatically_after=Duration.days(30),
                rotate_immediately_on_update=True,
            )

            my_cluster_proxy = rds.DatabaseProxy(
                self,
                "myrdsproxy",
                secrets=[my_cluster_credentials],
                proxy_target=rds.ProxyTarget.from_cluster(myrds),
                vpc=myvpc,
            )

            my_cluster_proxy.grant_connect(
                iam.Role.from_role_name(
                    self,
                    "mylambdarole",
                    role_name="mylambdaexecutionrole",
                )
            )

        else:
            myrds = rds.DatabaseCluster.from_database_cluster_attributes(
                self,
                "testrds",
                cluster_identifier=existing_rds_cluster_identifier,
            )

        myrds.node.add_dependency(lambda_function)

        my_api = apigw.RestApi(
            self,
            "myapi",
            rest_api_name=api_name,
        )

        deployment = apigw.Deployment(
            self,
            "Deployment",
            api=my_api,
            retain_deployments=True,
        )

        api_log_group = logs.LogGroup(
            self,
            "apiLogs",
        )
        stage = apigw.Stage(
            self,
            "Stage",
            deployment=deployment,
            stage_name=stage_name,
            access_log_destination=apigw.LogGroupLogDestination(api_log_group),
            access_log_format=apigw.AccessLogFormat.clf(),
            tracing_enabled=True,
            logging_level=apigw.MethodLoggingLevel.INFO,
        )

        method = apigw.Method(
            self,
            "Method",
            http_method="GET",
            resource=my_api.root,
            integration=apigw.LambdaIntegration(lambda_function),
        )

        my_distro = cloudfront.Distribution(
            self,
            "mydist",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.RestApiOrigin(my_api, origin_path=origin_path)
            ),
        )

        if create_hostedzone is False and existing_hosted_zone_id is not None:
            my_hosted_zone = route53.HostedZone.from_hosted_zone_attributes(
                self,
                "testhostedzone",
                hosted_zone_id=existing_hosted_zone_id,
                zone_name=domain_name,
            )
        elif create_public_hosted_zone is False:
            my_hosted_zone = route53.PrivateHostedZone(
                self,
                "testhostedzone",
                zone_name=domain_name,
                vpc=myvpc,
            )
        else:
            my_hosted_zone = route53.PublicHostedZone(
                self,
                "testhostedzone",
                zone_name=domain_name,
            )

        my_record_set = route53.ARecord(
            self,
            "myrecord",
            zone=my_hosted_zone,
            record_name=record_subdomain_name,
            target=route53.RecordTarget.from_alias(targets.CloudFrontTarget(my_distro)),
        )
        my_record_set.node.add_dependency(my_distro)
