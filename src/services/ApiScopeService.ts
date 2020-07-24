import { Service, Inject } from "typedi";
import { ApiScopeRepository } from "../repositories/ApiScopeRepository";
import { IllegalArgumentException, IllegalArgumentMessageQueueException } from "../errors/SecurityErrors";
import { scopeLogger, consumerLogger } from "../utils/LoggerUtil";
import { isNullOrWhitespace } from "../utils/Util";
import { ApiScope } from "../entities/ApiScope";

/**
 * Classe que possui as regras negociais referentes à UserScope.  
 */
@Service('apiScopeService')
export class ApiScopeService {

  @Inject("apiScopeRepository")
  private apiScopeRepository: ApiScopeRepository;  

  
  public setApiScopeRepository(apiScopeRepository:ApiScopeRepository):void {
    this.apiScopeRepository = apiScopeRepository;
  }


  /**
   * 
   */
  public async getScopes(api:string, verb:string): Promise<number[]> {
    scopeLogger.debug(`method getScopes has initialized. Parameters: api[[${api}], verb[${verb}]].`);
    this.validateParametersScope(api, verb);
    scopeLogger.debug(`method getScopes has finalized.`);
    return await this.apiScopeRepository.getScopes(api, verb);
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

public async delete(apiScope:ApiScope): Promise<void> {
  if (apiScope == null) {
    throw new IllegalArgumentException(`apiScope parameter is null or empty.`);
  } 
  consumerLogger.debug(`method delete has initialized. Parameters: apiscope [[${apiScope.api}] e [${apiScope.verb}]]`);
  this.validateApiAndVerb(apiScope);
  consumerLogger.debug(`method delete has finalized.`);
  return await this.apiScopeRepository.delete(apiScope);
}

public async updateInsert(apiScope:ApiScope): Promise<void> {
  if (apiScope == null) {
    throw new IllegalArgumentException(`apiScope parameter is null or empty.`);
  } 
  consumerLogger.debug(`method updateInsert has initialized. Parameters: apiscope [[${apiScope.api}] e [${apiScope.verb}]]`);
  this.validateApiAndVerb(apiScope);
  this.validateScopesForInsertUpdate(apiScope);    

  consumerLogger.debug(`method updateInsert has finalized.`);
  return await this.apiScopeRepository.updateInsert(apiScope);
}

private validateApiAndVerb(apiScope: ApiScope) {
  if (isNullOrWhitespace(apiScope.api)) {
    throw new IllegalArgumentMessageQueueException(`api field is null or empty.`);
  }
  consumerLogger.debug(`apiScope.api is a valid parameter.`);

  if (isNullOrWhitespace(apiScope.verb)) {
    throw new IllegalArgumentMessageQueueException(`verb field is null or empty.`);
  }
  consumerLogger.debug(`apiScope.verb is a valid parameter.`);
}

private validateScopesForInsertUpdate(apiScope: ApiScope) {    

    if (apiScope.scopes == undefined)  {
      throw new IllegalArgumentMessageQueueException(`scopes field is undefined.`);
    }
    consumerLogger.debug(`apiScope.scopes is a valid parameter.`);   
  
}

}