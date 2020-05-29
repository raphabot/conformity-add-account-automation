import * as AWS from 'aws-sdk';
import { throws } from 'assert';
const DEFAULT_REGION = 'us-east-1'
const axios = require('axios').default;
const yargs = require("yargs");
// import * as curlirize from 'axios-curlirize';
// curlirize(axios);

const RTM_REGIONS=[ "us-east-1", "us-east-2", "us-west-1", "us-west-2", "ca-central-1", "eu-west-1", "eu-central-1", "eu-west-2", "eu-west-3", "eu-north-1", "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-south-1", "sa-east-1", "ap-east-1 me-south-1"];
const CLASSIC_REGIONS=[ "us-east-1", "us-east-2", "us-west-1", "us-west-2", "ca-central-1", "eu-west-1", "eu-central-1", "eu-west-2", "eu-west-3", "eu-north-1", "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-south-1", "sa-east-1" ];


class CloudConformity {
  endpoint: string;
  apikey: string;
  url: string;
  profile: string;
  accountName: string;
  stage: string;
  cloudformation: AWS.CloudFormation;
  stackId: AWS.CloudFormation.StackId;
  stackDescription: AWS.CloudFormation.DescribeStacksOutput;
  externalId: string;
  awsAccountId: string;
  ccAccountId: string;
  ccOrganizationId: string;
  constructor(endpoint: string, apikey: string, profile?:string, accountName?:string, stage?:string ) {
    this.endpoint = endpoint;
    this.url = "https://" + endpoint + "-api.cloudconformity.com/v1/"
    this.apikey = apikey;
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: profile? profile : null});
    this.cloudformation = new AWS.CloudFormation({region: DEFAULT_REGION});
    this.profile = profile;
    this.accountName = accountName;
    this.stage = stage;
  };

  public async getOrganizationCloudConformityExternalId() {
    const path = "organisation/external-id";
    const result = await this.ccRequest("get", path);
    this.externalId = result.data.id;
    return this.externalId;
  };

  private async ccRequest (method: string, path: string, data?: object){
    try {
      return this.parseAxiosOutput(await axios(this.generateRequest(method, path, data? data : null)));
    } catch (error) {
      // Error 😨
      if (error.response) {
        /*
        * The request was made and the server responded with a
        * status code that falls out of the range of 2xx
        */
        console.log(JSON.stringify(error.response.data, null, 2));
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        /*
        * The request was made but no response was received, `error.request`
        * is an instance of XMLHttpRequest in the browser and an instance
        * of http.ClientRequest in Node.js
        */
        console.log(error.request);
      } else {
        // Something happened in setting up the request and triggered an Error
        console.log('Error', error.message);
      }
    throw error;
    }
  };
  
  private generateRequest = (method: string, path: string, data?: object) => {
    return {
      baseURL: this.url,
      url: path,
      method: method,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Authorization': 'ApiKey ' + this.apikey
      },
      responseType: 'json',
      ...data && {data : data}
    };
  };

  private parseAxiosOutput = (axiosOutput: any) => {
    return axiosOutput.data;
  };

  public async createCloudConformityStack(externalId: string) {
    const params = {
      StackName: "CloudConformity",
      Capabilities: ["CAPABILITY_NAMED_IAM"],
      TemplateURL: "https://s3-us-west-2.amazonaws.com/cloudconformity/CloudConformity.template",
      Parameters: [
        {
          ParameterKey: "AccountId",
          ParameterValue: "717210094962"
        },
        {
          ParameterKey: "ExternalId",
          ParameterValue: externalId
        }
      ]
    };
    try {
      const result = await this.cloudformation.createStack(params).promise();
      this.stackId = result.StackId;
      return this.stackId;
    } catch (error) {
      throw(error);
    }
  };

  private async checkStackStatus(stackId?: string) {
    const params = { StackName: stackId? stackId : this.stackId};
    try {
      const result = await this.cloudformation.describeStacks(params).promise();
      this.stackDescription = result;
      return this.stackDescription;
    } catch (error) {
      throw error;
    }
  };

  public async waitForStackCompletition(stackId?: AWS.CloudFormation.StackId) {
    try {
      this.stackDescription = stackId? await this.checkStackStatus(stackId) : this.stackDescription;
      while (this.stackDescription.Stacks[0].StackStatus == "CREATE_IN_PROGRESS"){
        this.stackDescription = await this.checkStackStatus(stackId);
        await this.sleep(5000);
      }
      return this.stackDescription.Stacks[0].StackStatus;
    } catch (error) {
      throw error;
    }
  };

  public getCloudConformityRoleArn(stackDescription?: AWS.CloudFormation.DescribeStacksOutput){
    const stack = stackDescription? stackDescription : this.stackDescription;
    return stack.Stacks[0].Outputs[1].OutputValue;
  }

  public async addAWSAccountToCC(ccName: string, ccEnvironment: string, roleArn: AWS.CloudFormation.Arn, externalId: string) {
    const data = {
      "data": {
        "type":  "account",
        "attributes":  {
          "name":  ccName,
          "environment": ccEnvironment,
          "access":  {
            "keys":  {
              "roleArn": roleArn,
              "externalId": externalId
            }
          },
          "costPackage":  true,
          "hasRealTimeMonitoring":  true
        }
      }
    };
    const path = "accounts"
    const result = await this.ccRequest("POST", path, data);
    this.awsAccountId = result.data.attributes['awsaccount-id'];
    this.ccAccountId = result.data.id;
    this.ccOrganizationId = result.data.relationships.organisation.data.id;
    return result;
  };

  private isRegionEnabled(region: string) {
    if (CLASSIC_REGIONS.includes(region)){
      return true;
    }
    // else if (aws sts get-caller-identity --region "$region" >/dev/null 2>&1){
    //   return true;
    // };
    return false;
  }

  private async deployRTM(region: string) {
    const STACK_VERSION = 5;
    const params = {
      StackName: "CloudConformityMonitoring",
      Capabilities: ["CAPABILITY_IAM"],
      TemplateURL: "https://s3-us-west-2.amazonaws.com/cloud-conformity-public-staging-us-west-2/monitoring/event-bus-template.yml",
      OnFailure: "DO_NOTHING",
      Parameters: [
        {
          ParameterKey: "CloudConformityAccountId",
          ParameterValue: "105579776292"
        }
      ],
      Tags: [
        {
          Key: 'Version', 
          Value: STACK_VERSION.toString()
        },
        {
          Key: 'LastUpdatedTime', 
          Value: (new Date).toString()
        }
      ]
    };
    try {
      this.cloudformation = new AWS.CloudFormation({region: region})
      const result = await this.cloudformation.createStack(params).promise();
      this.stackId = result.StackId;
      this.cloudformation = new AWS.CloudFormation({region: DEFAULT_REGION})
      return this.stackId;
    } catch (error) {
      throw(error);
    }

  };

  public async deployRTMtoRegions(regions: string[]){
    let results = [];
    for (const region of regions){
      if (this.isRegionEnabled(region)){
        results.push(await this.deployRTM(region));
      }
    }
    return results;
  };

  public async manualScan(){
    return await cc.ccRequest("POST", "accounts/" + this.ccAccountId + "/scan")
  };

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const options = yargs
 .usage("Usage: -k <api-key> -e <endpoint> -p <aws-name-profile> -n <account-name> -env <environment-tag>")
 .option("e", { alias: "endpoint", describe: "Cloud Conformity endpoint. Defaults to us-west-2", type: "string", default: "us-west-2", demandOption: false })
 .option("k", { alias: "apikey", describe: "Cloud Conformity api key.", type: "string", demandOption: true })
 .option("p", { alias: "profile", describe: "The name of an AWS CLI Profile with sufficient rights and access to services.", type: "string", demandOption: true })
 .option("n", { alias: "accountName", describe: "Name that will be used to identify the account in Cloud Conformity", type: "string", demandOption: true })
 .option("env", { alias: "environment", describe: "Environment Tag", type: "string", demandOption: true })
 .help('help')
 .argv;

const endpoint = options.endpoint;
const apikey = options.apikey;
const profile = options.profile;
const accountName = options.accountName;
const stage = options.environment
let cc = new CloudConformity(endpoint, apikey, profile, accountName, stage);

cc.getOrganizationCloudConformityExternalId()
  .then(result =>{
    console.log("ExternalId is: " + result);
    return cc.createCloudConformityStack(result);
  })
  .then(async res => {
    console.log("Cloud Conformity stack Arn is: " + res);
    console.log("Waiting for stack to finalize creation.");
    return await cc.waitForStackCompletition(res);
  })
  .then(async res => {
    console.log("Stack status is: " + res);
    console.log("Adding AWS account to CC.");
    return await cc.addAWSAccountToCC(cc.accountName, cc.stage, cc.getCloudConformityRoleArn(), cc.externalId);
  })
  .then(async res => {
    console.log(res);
    console.log("Deploying RTM to the regions...");
    return await cc.deployRTMtoRegions(RTM_REGIONS);
  })
  .then(async res => {
    console.log("RTM deployed.");
    console.log("Starting scan.")
    return await cc.manualScan();
  })
  .then(async res => {
    console.log("Scan started.");
  })
  .catch (err => {
    console.error(err);
  });

