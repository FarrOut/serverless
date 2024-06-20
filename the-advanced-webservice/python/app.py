#!/usr/bin/env python3
import os

from aws_cdk import (
    Duration,
    App,
    Stack,
    Environment,
    Tags,
    aws_lambda as lambda_,
    aws_rds as rds,
)

from the_advanced_webservice.the_advanced_webservice_stack import (
    TheAdvancedWebserviceStack,
)


app = App()

env = Environment(
    account=os.getenv("CDK_DEFAULT_ACCOUNT"), region=os.getenv("CDK_DEFAULT_REGION")
)

TheAdvancedWebserviceStack(
    app,
    "TheAdvancedWebserviceStack",
    env=env,
    create_vpc=True,
    vpc_az=2,
    create_lambda=True,
    create_hostedzone=False,
    create_rdscluster=True,
    lambda_code_file_path="../function/app.py.zip",
    run_time=lambda_.Runtime.PYTHON_3_12,
    database_engine=rds.DatabaseClusterEngine.aurora_mysql(
        version=rds.AuroraMysqlEngineVersion.VER_3_06_0
    ),
    domain_name="xxxxxxx.awsps.myinstance.com",
    existing_hosted_zone_id=None,
    api_name="myapi",
    stage_name="dev",
    origin_path="/dev",
)

app.synth()
