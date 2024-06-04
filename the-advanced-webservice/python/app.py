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

env=Environment(
        account=os.getenv("CDK_DEFAULT_ACCOUNT"), region=os.getenv("CDK_DEFAULT_REGION")
    ),

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

TheAdvancedWebserviceStack(
    app,
    "TheAdvancedWebserviceStack",
    
)

app.synth()
