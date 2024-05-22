import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import { TheAdvancedWebserviceStack } from "../lib/the-advanced-webservice-stack";

describe("the stack", () => {

    test("synthesizes the way we expect", () => {
        const app = new cdk.App();

        const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", {
        });

        // Prepare the stack for assertions.
        const template = Template.fromStack(stack);

    });


    test('creates the expected number of API Gateways', () => {
        const app = new cdk.App();

        // WHEN
        const stack = new TheAdvancedWebserviceStack(app, "TheAdvancedWebserviceStack", {
        });

        // Prepare the stack for assertions.
        const template = Template.fromStack(stack);

        // THEN
        template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });











});


