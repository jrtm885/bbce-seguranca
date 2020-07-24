import { Service } from "typedi";
import AWS, { AWSError } from 'aws-sdk';
import DynamoDB, { DocumentClient, GetItemOutput, AttributeMap } from "aws-sdk/clients/dynamodb";
import { scopeLogger, consumerLogger } from '../utils/LoggerUtil'
import { PromiseResult } from "aws-sdk/lib/request";
import { EMPTY_RETURN, API_VERSION } from "../SecurityConstants";
import { IllegalArgumentException, ResourceNotFoundException } from "../errors/SecurityErrors";
import { isNullOrWhitespace } from "../utils/Util";
import { RepositoryParent } from "./RepositoryParent";
import { UserScope } from "../entities/UserScope";


/**
 * Classe responsável por conectar ao DynamoDB na tabela UserScope.
 * A tabela UserScope contem os campos: userEmail:String e scopes: numberSet
 */

@Service("userScopeRepository")
export class UserScopeRepository extends RepositoryParent {

  docClient: DocumentClient;

  dynamoDB: DynamoDB;

  public setDocumentClient(docClient: DocumentClient): void {
    this.docClient = docClient;
  }

  public constructor() {
    super(process.env.ENVIRONMENT, process.env.REGION, "ehub-user-scope-seguranca-");
    this.prepareConnection();
  }

  /**
   * Configura o AWS e cria um DocumentClient para realizar as consultas ao dynamoDB.
   */
  private prepareConnection(): void {
    AWS.config.update({
      region: this.region
    });
    this.dynamoDB = new AWS.DynamoDB({ apiVersion: API_VERSION });
    this.docClient = new AWS.DynamoDB.DocumentClient();
  }

  /**
   * Recupera todos os escopos de front-end de determinado usuário.
   * @param userEmail Paramêtro obrigatório. Email do usuário para recuperar os scopes de frontend. 
   * @returns number[] contendo todos os escopos de front-end do usuário.
   * @throws IllegalArgumentException, ResourceNotFoundException
   */
  public async getFrontScopesByUser(userEmail: string): Promise<number[]> {
    scopeLogger.debug(`method getFrontScopesByUser has initialized. Parameters: userEmail[${userEmail}]`);
    if (isNullOrWhitespace(userEmail)) {
      scopeLogger.error("userEmail parameter is required");
      throw new IllegalArgumentException("userEmail parameter is required");
    }

    const params = {
      TableName: this.tableName,
      Key: {
        "userEmail": userEmail
      },
      "projectionExpression": "frontScopes"
    };

    const result: PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWS.AWSError> =
      await this.docClient.get(params).promise();
    if (JSON.stringify(result) == EMPTY_RETURN) {
      scopeLogger.error(`No record found for email: ${userEmail}`);
      throw new ResourceNotFoundException(`userscope [${userEmail}] not found.`);
    }

    const scopes: number[] = (JSON.parse(JSON.stringify((result.Item as AttributeMap).frontScopes as string)) as number[]);
    scopeLogger.debug(`Found ${scopes.length} frontScopes for email: ${userEmail}. frontScopes: ${JSON.stringify(scopes)}`);
    scopeLogger.debug("method getFrontScopesByUser has finalized.");
    return scopes;
  }

  /**
   * Recupera todos os escopos de backend de determinado usuário.
   * @param userEmail Paramêtro obrigatório. Email do usuário para recuperar os scopes de backend. 
   * @returns number[] contendo todos os escopos de backend do usuário.
   * @throws IllegalArgumentException, ResourceNotFoundException
   */
  public async getBackScopesByUser(userEmail: string): Promise<number[]> {
    scopeLogger.debug(`method getBackScopesByUser has initialized. Parameters: userEmail[${userEmail}]`);
    if (isNullOrWhitespace(userEmail)) {
      scopeLogger.error("userEmail parameter is required");
      throw new IllegalArgumentException("userEmail parameter is required");
    }

    const params = {
      TableName: this.tableName,
      Key: {
        "userEmail": userEmail
      },
      "projectionExpression": "backScopes"
    };

    const result: PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWS.AWSError> =
      await this.docClient.get(params).promise();

    if (JSON.stringify(result) == EMPTY_RETURN) {
      scopeLogger.error(`No record found for email: ${userEmail}`);
      throw new ResourceNotFoundException(`userscope [${userEmail}] not found.`);
    }

    const scopes: number[] = (JSON.parse(JSON.stringify((result.Item as AttributeMap).backScopes as string)) as number[]);
    scopeLogger.debug(`Found ${scopes.values.length} backScopes for email: ${userEmail}. backScopes: ${JSON.stringify(scopes)}`);
    scopeLogger.debug("method getBackScopesByUser has finalized.");
    return scopes;
  }

  public async updateInsert(userScope: UserScope): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        "userEmail": userScope.userEmail,
        "frontScopes": userScope.frontScopes,
        "backScopes": userScope.backScopes
      }
    };
    await this.docClient.put(params).promise();
    consumerLogger.info(`userScope [${userScope.userEmail}] was inserted/updated successfully`);
  }

  public async delete(userScope: UserScope): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        "userEmail": userScope.userEmail
      }

    };    
    await this.docClient.delete(params).promise();
    consumerLogger.info(`userScope [${userScope.userEmail}] was deleted successfully`);
  }



}