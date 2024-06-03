#!/usr/bin/env python3
import os

import aws_cdk as cdk

from the_advanced_webservice.the_advanced_webservice_stack import (
    TheAdvancedWebserviceStack,
)


app = cdk.App()

TheAdvancedWebserviceStack(
    app,
    "TheAdvancedWebserviceStack",
    env=cdk.Environment(
        account=os.getenv("CDK_DEFAULT_ACCOUNT"), region=os.getenv("CDK_DEFAULT_REGION")
    ),
)

app.synth()
