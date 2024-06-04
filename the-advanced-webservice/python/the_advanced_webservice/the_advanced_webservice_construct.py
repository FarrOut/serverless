from aws_cdk import (
    Duration,
    App,
    Stack,
    Tags,
    aws_lambda as lambda_,
    aws_rds as rds,
)
from constructs import Construct
from aws_cdk import aws_lambda as lambda_


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
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
