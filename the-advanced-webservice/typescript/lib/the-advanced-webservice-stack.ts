import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import { TheAdvancedWebservice, TheAdvancedWebserviceProps } from './the-advanced-webservice-construct';



export class TheAdvancedWebserviceStack extends Stack {
  constructor(scope: Construct, id: string, props: TheAdvancedWebserviceProps) {
    super(scope, id, props);

    //An example of how to use/define our L3 construct
    const application = new TheAdvancedWebservice(this, 'ServerlessApp', props)

  }
}





