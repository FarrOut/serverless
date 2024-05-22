import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import { TheAdvancedWebserviceStack } from "../lib/the-advanced-webservice-stack";

describe("TheAdvancedWebserviceStack", () => {
    test("synthesizes the way we expect", () => {
        const app = new cdk.App();

        // Create the StateMachineStack.
        const theStack = new TheAdvancedWebserviceStack(app, "StateMachineStack", {
        });

        // Prepare the stack for assertions.
        const template = Template.fromStack(theStack);

    });
});