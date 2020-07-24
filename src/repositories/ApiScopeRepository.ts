import { Service } from "typedi";
import AWS, { AWSError } from 'aws-sdk';
import DynamoDB, { DocumentClient, GetItemOutput, AttributeMap } from "aws-sdk/clients/dynamodb";
import { scopeLogger, consumerLogger } from '../utils/LoggerUtil'
import { PromiseResult } from "aws-sdk/lib/request";
import { EMPTY_RETURN, API_VERSION } from "../SecurityConstants";
import { IllegalArgumentException, ResourceNotFoundException } from "../errors/SecurityErrors";
import { isNullOrWhitespace } from "../utils/Util";
import { RepositoryParent } from "./RepositoryParent";
import { ApiScope } from "../entities/ApiScope";

/**
 * Classe responsável por conectar ao DynamoDB na tabela UserScope.
 * A tabela UserScope contem os campos: userEmail:String e scopes: numberSet
 */
@Service("apiScopeRepository")
export class ApiScopeRepository extends RepositoryParent {

  docClient: DocumentClient;

  dynamoDB: DynamoDB;

  public setDocumentClient(docClient:DocumentClient):void {
    this.docClient = docClient;
  }
  
  public constructor() {  
    super(process.env.ENVIRONMENT, process.env.REGION, "ehub-api-scope-seguranca-");   
    this.prepareConnection();    
  }

  /**
   * Configura o AWS e cria um DocumentClient para realizar as consultas ao dynamoDB.
   */
  private prepareConnection() {
    AWS.config.update({
      region: this.region
    });
    this.dynamoDB = new AWS.DynamoDB({ apiVersion: API_VERSION });
    this.docClient = new AWS.DynamoDB.DocumentClient();
  }

  public async getScopes(api:string, verb:string): Promise<number[]>  {
    scopeLogger.debug(`method getScopes has initialized. Parameters: api[${api}]; verb[${verb}]`);
    this.validateParametersScope(api, verb);

    const params = {
      TableName: this.tableName,
      Key: {
        "api": api,
        "verb": verb
      },
      "projectionExpression": "scopes"
    };

    const result: PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWS.AWSError> = 
        await this.docClient.get(params).promise();
    
    const scopes = this.getResult(result, api, verb);
    scopeLogger.debug(`Found ${scopes.values.length} scopes for apiscope [[${api}] e [${verb}]]. scopes: ${JSON.stringify(scopes)}`);
    scopeLogger.debug("method getScopes has finalized.");
    return scopes;
  }


    private getResult(result: PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWS.AWSError>, api: string, verb: string) {
        if (JSON.stringify(result) == EMPTY_RETURN) {
            scopeLogger.error(`No record found for apiscope [[${api}] e [${verb}]]`);
            throw new ResourceNotFoundException(`apiscope [[${api}] e [${verb}]] not found.`);
        }
        const scopes:number[] = (JSON.parse(JSON.stringify((result.Item as AttributeMap).scopes as string)) as number[]);
        
        return scopes;
    }

    private validateParametersScope(api: string, verb: string) {
        if (isNullOrWhitespace(api)) {
            scopeLogger.error("api parameter is required");
            throw new IllegalArgumentException("api parameter is required");
        }

        if (isNullOrWhitespace(verb)) {
            scopeLogger.error("verb parameter is required");
            throw new IllegalArgumentException("verb parameter is required");
        }
    }

    public async updateInsert(apiScope: ApiScope): Promise<void> {
      const params = {
        TableName: this.tableName,
        Item: {
          "api": apiScope.api,
          "verb": apiScope.verb,
          "scopes": apiScope.scopes
        }
      };
      await this.docClient.put(params).promise();
      consumerLogger.info(`apiscope [[${apiScope.api}] e [${apiScope.verb}]] was inserted/updated successfully`);
    }
  
    public async delete(apiScope: ApiScope): Promise<void> {
      const params = {
        TableName: this.tableName,
        Key: {
          "api": apiScope.api,
          "verb": apiScope.verb
        }
  
      };    
      await this.docClient.delete(params).promise();
      consumerLogger.info(`apiscope [[${apiScope.api}] e [${apiScope.verb}]] was deleted successfully`);
    }
}