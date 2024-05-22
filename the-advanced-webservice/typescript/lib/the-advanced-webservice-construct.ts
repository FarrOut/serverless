import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secret from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { HttpUrlIntegration, HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as certificate from 'aws-cdk-lib/aws-certificatemanager';
import { App, Duration, Stack, NestedStack, NestedStackProps, StackProps } from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';


export interface TheAdvancedWebserviceConstructProps extends StackProps {
  //define construct properties here
  //required properties
  createvpc?: boolean;
  createlambda?: boolean;
  createrdscluster?: boolean;
  createhostedzone?: boolean;
  apiName?: string;
  stageName?: string;
  originPath?: string;

  //define the below additional properties when createvpc is set to true
  vpcAz?: number;
 
  //define the below additional property when using an existing vpc and createvpc is set to false
  vpcId?: string;

  //define the below additional property if createhostedzone is set to true
  createpublichostedzone?: boolean;

  //define this additional property if createlambda is set to false
  functionArn?: string;

  //define this additional property if createlambda is set to true
  lambdaCodeFilePath?: string; //the file directory where lambda zipped file is
  runTime?: lambda.Runtime |any; //the lambda runtime
  

  //define this additional property if createrds is set to false
  existingRdsClusterIdentifier?: string;

  //define this additional properties if createrds is set to true
  databaseEngine?: rds.DatabaseClusterEngine |any;

  //define this additional property if createhostedzone is set to false
  existingDomainName?: string; //TODO this fails to compile when not provided...
  existingHostedZoneId?: string;

  //define this additional property if createhostedzone is set to true 
  newDomainName?: string;
  recordSubDomainName?: string;
  
}

//Define L3 Construct
export class TheAdvancedWebserviceConstruct extends Construct {

  constructor(scope: Construct, id: string, props: TheAdvancedWebserviceConstructProps = {}) {
    super(scope, id);

                    // CONSTRUCT CONTENTS

  //DEFINE VPC RESOURCES

  //condition to allow use of either an existing vpc or create a new one based on context values declared

    let myvpc;

    if (props.createvpc==false) {
      myvpc = ec2.Vpc.fromLookup(this, 'testvpc', { 
         vpcId: props.vpcId
    
      });     
    }
    else {
      myvpc = new ec2.Vpc(this, 'testvpc', {
         ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
         maxAzs: props.vpcAz
      });
    }
 
  //DEFINE LAMBDA RESOURCES

  //declare context values

  const existingfunctionname = this.node.tryGetContext('existingfunctionname');

//condition to allow use of either an existing aurora cluster or create a new aurora cluster based on context value

  let mylambda;
  let mylambdarole;

  let lambdacodefilepath:string = props.lambdaCodeFilePath!;

  let functionarn:string = props.functionArn!;

  if (props.createlambda==false) {
    mylambda = lambda.Function.fromFunctionAttributes(this, 'mylambda', {
      sameEnvironment: true,
      functionArn: functionarn
    });     
  }
  else {
    mylambdarole = new iam.Role(this, 'mylambdaexecutionrole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'mylambdaexecutionrole',
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, 'mypolicy','arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'), 
        iam.ManagedPolicy.fromManagedPolicyArn(this, 'mypolicy2', 'arn:aws:iam::aws:policy/AmazonEC2FullAccess'),
      ]
    });


    mylambda = new lambda.Function(this, 'mylambda', {
      runtime: props.runTime,
      code: lambda.Code.fromAsset(lambdacodefilepath),
      handler: 'rdsLambda.handler',
      vpc: myvpc,
      role: mylambdarole,
      vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,},

    });
  }

  //DEFINE RDS RESOURCES

  //condition to allow use of either an existing aurora cluster or create a new aurora cluster based on context values declared

    let myrds;
    let myclustersubnetgroup;
    let myclusterparametergroup;    
    let myclustercredentials;
    let myclusterproxy;
    let existingrdsclusteridentifier:string = props.existingRdsClusterIdentifier!; 

    if (props.createrdscluster==false) {
      myrds = rds.DatabaseCluster.fromDatabaseClusterAttributes(this, 'testrds',{
        clusterIdentifier: existingrdsclusteridentifier,
      });
    }

    else {
      myclustersubnetgroup = new rds.SubnetGroup(this, 'testclustersubnetgroup',{
        vpc: myvpc,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        description: 'test subnet group',
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }
      } );

      myclusterparametergroup = new rds.ParameterGroup(this, 'testclusterparametergroup',{
        engine: props.databaseEngine,
        parameters: {
          aws_default_lambda_role: 'mylambdaexecutionrole',
        }
        
      });

      myclustercredentials =  new rds.DatabaseSecret(this, 'myrdsscreds', {
        username: 'ClusterAdmin',
        secretName: 'myrdsscreds',

      });

      myrds = new rds.DatabaseCluster(this, 'testauroracluster', {
         engine: props.databaseEngine,         
         vpc: myvpc,
         defaultDatabaseName: 'demos',
         subnetGroup: myclustersubnetgroup,
         parameterGroup: myclusterparametergroup,
         credentials: { username: 'clusteradmin' },
         serverlessV2MinCapacity: 2,
         serverlessV2MaxCapacity: 64,
         port: 3306,
         writer: rds.ClusterInstance.serverlessV2 ('writer'),
         readers: [rds.ClusterInstance.serverlessV2 ('reader', {scaleWithWriter: true})],
         storageEncrypted: true,
         storageType: rds.DBClusterStorageType.AURORA,

      });

      myrds.addRotationSingleUser({
        automaticallyAfter: cdk.Duration.days(30),
        rotateImmediatelyOnUpdate: true,
        
      });

      //add proxy and lambda connection via the proxy to the rds database cluster
      myclusterproxy = new rds.DatabaseProxy(this, 'rdsProxy', {
        proxyTarget: rds.ProxyTarget.fromCluster(myrds),
        secrets: [myclustercredentials],
        vpc: myvpc
      });

      myclusterproxy.grantConnect( iam.Role.fromRoleName(this, 'mylambdarole','mylambdaexecutionrole'))

    }

  //ensure the rds is not created before the lambda function 

    myrds.node.addDependency(mylambda)
 
  //DEFINE API GATEWAY RESOURCES

  //this resource requires creation of a new resource

  //define api resources
  let apiname:string = props.apiName!; 

  let stagename:string = props.stageName!; 

  const DefaultIntegration = new apigateway.LambdaIntegration(mylambda);

  const apiLogGroup = new logs.LogGroup(this, "apiLogs");

  let myapi = new apigateway.RestApi(this, 'myapi', { 
    restApiName: apiname
  
  });

  const deployment = new apigateway.Deployment(this, 'Deployment', {
    api: myapi,
    retainDeployments: true
  
  });

  const stage = new apigateway.Stage(this, 'Stage', {
    deployment: deployment,
    stageName: stagename,
    accessLogDestination: new apigateway.LogGroupLogDestination(apiLogGroup),
    accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
    tracingEnabled: true,
    loggingLevel: apigateway.MethodLoggingLevel.INFO
  })

  const method = new apigateway.Method(this, 'Method', {
    httpMethod: 'GET',
    resource: myapi.root,
    integration: DefaultIntegration 
  })

  //DEFINE CLOUDFRONT RESOURCES

  let originpath:string = props.originPath!; 

  //define resources

  const mydistribution = new cloudfront.Distribution(this, 'mydist', {
    defaultBehavior: {
      origin: new origins.RestApiOrigin(myapi,{originPath: originpath}),
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      
    },
    minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021 
  })

  //ensure the distribution is not created before the api 

  mydistribution.node.addDependency(myapi)
 
  //DEFINE ROUTE 53 RESOURCES
 
//condition to allow use of either an existing hosted zone or create a new public or private hosted zone based on context values declared

  let myhostedzone;
  let existingdomainname:string = props.existingDomainName!;
  let existinghostedzoneid:string = props.existingHostedZoneId!;
  let newdomainname:string = props.newDomainName!;
  let recordsubdomainname:string = props.recordSubDomainName!;

  if (props.createhostedzone==false) {
    myhostedzone = route53.HostedZone.fromHostedZoneAttributes(this, 'testhostedzone', {
       zoneName: existingdomainname,
       hostedZoneId: existinghostedzoneid,

    });
  } else if (props.createpublichostedzone==false) {
    myhostedzone = new route53.PrivateHostedZone(this, 'testhostedzone', {
       zoneName: newdomainname,
       vpc: myvpc
    });
  } else {
    myhostedzone = new route53.PublicHostedZone(this, 'testhostedzone', {
       zoneName: newdomainname
    });
  }

  const myrecordset = new route53.ARecord(this, 'myrecord', {
    zone: myhostedzone,
    target: route53.RecordTarget.fromAlias( new targets.CloudFrontTarget(mydistribution)),
    recordName: recordsubdomainname
  })

  //ensure the recordset is not created before the distribution

  myrecordset.node.addDependency(mydistribution)
 
 
  }
}
 