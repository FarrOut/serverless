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

from the_advanced_webservice.the_advanced_webservice_construct import (
    TheAdvancedWebservice,
)


class TheAdvancedWebserviceStack(Stack):

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
        existing_rds_cluster_identifier: str = None,
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        TheAdvancedWebservice(
            self,
            "TheAdvancedWebservice",
            create_vpc=create_vpc,
            vpc_id=vpc_id,
            vpc_az=vpc_az,
            create_lambda=create_lambda,
            create_hostedzone=create_hostedzone,
            create_rdscluster=create_rdscluster,
            lambda_code_file_path=lambda_code_file_path,
            run_time=run_time,
            database_engine=database_engine,
            existing_rds_cluster_identifier=existing_rds_cluster_identifier,
            existing_domain_name=existing_domain_name,
            # existing_hosted_zone_id= str,
            api_name=api_name,
            stage_name=stage_name,
            origin_path=origin_path,
        )
