"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var AWS = require("aws-sdk");
var DEFAULT_REGION = 'us-east-1';
var axios = require('axios')["default"];
var yargs = require("yargs");
// import * as curlirize from 'axios-curlirize';
// curlirize(axios);
var RTM_REGIONS = ["us-east-1", "us-east-2", "us-west-1", "us-west-2", "ca-central-1", "eu-west-1", "eu-central-1", "eu-west-2", "eu-west-3", "eu-north-1", "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-south-1", "sa-east-1", "ap-east-1 me-south-1"];
var CLASSIC_REGIONS = ["us-east-1", "us-east-2", "us-west-1", "us-west-2", "ca-central-1", "eu-west-1", "eu-central-1", "eu-west-2", "eu-west-3", "eu-north-1", "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-south-1", "sa-east-1"];
var CloudConformity = /** @class */ (function () {
    function CloudConformity(endpoint, apikey, profile, accountName, stage) {
        var _this = this;
        this.generateRequest = function (method, path, data) {
            return __assign({ baseURL: _this.url, url: path, method: method, headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Authorization': 'ApiKey ' + _this.apikey
                }, responseType: 'json' }, data && { data: data });
        };
        this.parseAxiosOutput = function (axiosOutput) {
            return axiosOutput.data;
        };
        this.endpoint = endpoint;
        this.url = "https://" + endpoint + "-api.cloudconformity.com/v1/";
        this.apikey = apikey;
        AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: profile ? profile : null });
        this.cloudformation = new AWS.CloudFormation({ region: DEFAULT_REGION });
        this.profile = profile;
        this.accountName = accountName;
        this.stage = stage;
    }
    ;
    CloudConformity.prototype.getOrganizationCloudConformityExternalId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var path, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = "organisation/external-id";
                        return [4 /*yield*/, this.ccRequest("get", path)];
                    case 1:
                        result = _a.sent();
                        this.externalId = result.data.id;
                        return [2 /*return*/, this.externalId];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.ccRequest = function (method, path, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this.parseAxiosOutput;
                        return [4 /*yield*/, axios(this.generateRequest(method, path, data ? data : null))];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                    case 2:
                        error_1 = _b.sent();
                        // Error 😨
                        if (error_1.response) {
                            /*
                            * The request was made and the server responded with a
                            * status code that falls out of the range of 2xx
                            */
                            console.log(JSON.stringify(error_1.response.data, null, 2));
                            console.log(error_1.response.status);
                            console.log(error_1.response.headers);
                        }
                        else if (error_1.request) {
                            /*
                            * The request was made but no response was received, `error.request`
                            * is an instance of XMLHttpRequest in the browser and an instance
                            * of http.ClientRequest in Node.js
                            */
                            console.log(error_1.request);
                        }
                        else {
                            // Something happened in setting up the request and triggered an Error
                            console.log('Error', error_1.message);
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.createCloudConformityStack = function (externalId) {
        return __awaiter(this, void 0, void 0, function () {
            var params, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
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
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.cloudformation.createStack(params).promise()];
                    case 2:
                        result = _a.sent();
                        this.stackId = result.StackId;
                        return [2 /*return*/, this.stackId];
                    case 3:
                        error_2 = _a.sent();
                        throw (error_2);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.checkStackStatus = function (stackId) {
        return __awaiter(this, void 0, void 0, function () {
            var params, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = { StackName: stackId ? stackId : this.stackId };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.cloudformation.describeStacks(params).promise()];
                    case 2:
                        result = _a.sent();
                        this.stackDescription = result;
                        return [2 /*return*/, this.stackDescription];
                    case 3:
                        error_3 = _a.sent();
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.waitForStackCompletition = function (stackId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        _a = this;
                        if (!stackId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkStackStatus(stackId)];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = this.stackDescription;
                        _d.label = 3;
                    case 3:
                        _a.stackDescription = _b;
                        _d.label = 4;
                    case 4:
                        if (!(this.stackDescription.Stacks[0].StackStatus == "CREATE_IN_PROGRESS")) return [3 /*break*/, 7];
                        _c = this;
                        return [4 /*yield*/, this.checkStackStatus(stackId)];
                    case 5:
                        _c.stackDescription = _d.sent();
                        return [4 /*yield*/, this.sleep(5000)];
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, this.stackDescription.Stacks[0].StackStatus];
                    case 8:
                        error_4 = _d.sent();
                        throw error_4;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.getCloudConformityRoleArn = function (stackDescription) {
        var stack = stackDescription ? stackDescription : this.stackDescription;
        return stack.Stacks[0].Outputs[1].OutputValue;
    };
    CloudConformity.prototype.addAWSAccountToCC = function (ccName, ccEnvironment, roleArn, externalId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, path, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            "data": {
                                "type": "account",
                                "attributes": {
                                    "name": ccName,
                                    "environment": ccEnvironment,
                                    "access": {
                                        "keys": {
                                            "roleArn": roleArn,
                                            "externalId": externalId
                                        }
                                    },
                                    "costPackage": true,
                                    "hasRealTimeMonitoring": true
                                }
                            }
                        };
                        path = "accounts";
                        return [4 /*yield*/, this.ccRequest("POST", path, data)];
                    case 1:
                        result = _a.sent();
                        this.awsAccountId = result.data.attributes['awsaccount-id'];
                        this.ccAccountId = result.data.id;
                        this.ccOrganizationId = result.data.relationships.organisation.data.id;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.isRegionEnabled = function (region) {
        if (CLASSIC_REGIONS.includes(region)) {
            return true;
        }
        // else if (aws sts get-caller-identity --region "$region" >/dev/null 2>&1){
        //   return true;
        // };
        return false;
    };
    CloudConformity.prototype.deployRTM = function (region) {
        return __awaiter(this, void 0, void 0, function () {
            var STACK_VERSION, params, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        STACK_VERSION = 5;
                        params = {
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
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.cloudformation = new AWS.CloudFormation({ region: region });
                        return [4 /*yield*/, this.cloudformation.createStack(params).promise()];
                    case 2:
                        result = _a.sent();
                        this.stackId = result.StackId;
                        this.cloudformation = new AWS.CloudFormation({ region: DEFAULT_REGION });
                        return [2 /*return*/, this.stackId];
                    case 3:
                        error_5 = _a.sent();
                        throw (error_5);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.deployRTMtoRegions = function (regions) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, regions_1, region, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        results = [];
                        _i = 0, regions_1 = regions;
                        _c.label = 1;
                    case 1:
                        if (!(_i < regions_1.length)) return [3 /*break*/, 4];
                        region = regions_1[_i];
                        if (!this.isRegionEnabled(region)) return [3 /*break*/, 3];
                        _b = (_a = results).push;
                        return [4 /*yield*/, this.deployRTM(region)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.manualScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cc.ccRequest("POST", "accounts/" + this.ccAccountId + "/scan")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ;
    CloudConformity.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return CloudConformity;
}());
var options = yargs
    .usage("Usage: -k <api-key> -e <endpoint> -p <aws-name-profile> -n <account-name> -env <environment-tag>")
    .option("e", { alias: "endpoint", describe: "Cloud Conformity endpoint. Defaults to us-west-2", type: "string", "default": "us-west-2", demandOption: false })
    .option("k", { alias: "apikey", describe: "Cloud Conformity api key.", type: "string", demandOption: true })
    .option("p", { alias: "profile", describe: "The name of an AWS CLI Profile with sufficient rights and access to services.", type: "string", demandOption: true })
    .option("n", { alias: "accountName", describe: "Name that will be used to identify the account in Cloud Conformity", type: "string", demandOption: true })
    .option("env", { alias: "environment", describe: "Environment Tag", type: "string", demandOption: true })
    .help('help')
    .argv;
var endpoint = options.endpoint;
var apikey = options.apikey;
var profile = options.profile;
var accountName = options.accountName;
var stage = options.environment;
var cc = new CloudConformity(endpoint, apikey, profile, accountName, stage);
cc.getOrganizationCloudConformityExternalId()
    .then(function (result) {
    console.log("ExternalId is: " + result);
    return cc.createCloudConformityStack(result);
})
    .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Cloud Conformity stack Arn is: " + res);
                console.log("Waiting for stack to finalize creation.");
                return [4 /*yield*/, cc.waitForStackCompletition(res)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); })
    .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Stack status is: " + res);
                console.log("Adding AWS account to CC.");
                return [4 /*yield*/, cc.addAWSAccountToCC(cc.accountName, cc.stage, cc.getCloudConformityRoleArn(), cc.externalId)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); })
    .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(res);
                console.log("Deploying RTM to the regions...");
                return [4 /*yield*/, cc.deployRTMtoRegions(RTM_REGIONS)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); })
    .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("RTM deployed.");
                console.log("Starting scan.");
                return [4 /*yield*/, cc.manualScan()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); })
    .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Scan started.");
        return [2 /*return*/];
    });
}); })["catch"](function (err) {
    console.error(err);
});
