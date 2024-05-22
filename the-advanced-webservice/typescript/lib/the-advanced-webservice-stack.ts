import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import { TheAdvancedWebserviceConstruct } from './the-advanced-webservice-construct';



export class TheAdvancedWebserviceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //An example of how to use/define our L3 construct
    const application = new TheAdvancedWebserviceConstruct(this, 'ServerlessApp', {
      createvpc: true,
      vpcAz: 2,
      createlambda: true,
      createhostedzone: false,
      createrdscluster: true,
      lambdaCodeFilePath: "./function/app.py.zip",
      runTime: lambda.Runtime.PYTHON_3_12,
      databaseEngine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_06_0 }),
      existingDomainName: "xxxxxxx.awsps.myinstance.com",
      // existingHostedZoneId: "XXXXXXXXXXXXXXXX",
      apiName: 'myapi',
      stageName: 'dev',
      originPath: '/dev'
    })
  }
}





