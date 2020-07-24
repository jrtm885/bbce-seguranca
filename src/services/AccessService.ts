import { Service, Inject } from "typedi";
import { ApiScopeService } from "./ApiScopeService";
import { UserScopeService } from "./UserScopeService";
import { IllegalArgumentException } from "../errors/SecurityErrors";
import { scopeLogger } from "../utils/LoggerUtil";
import { isNullOrWhitespace } from "../utils/Util";
import { API_VERSION_REGEX, PATH_PARAM_REGEX, PATH_PARAM_IDENTIFIER, SLASH } from "../SecurityConstants";

/**
 * Classe que possui as regras negociais referentes à validação se o 
 * usuário possui as devidas permissões para acessar determinada api.  
 */
@Service('accessService')
export class AccessService {

  @Inject("apiScopeService")
  private apiScopeService: ApiScopeService;  
  
  @Inject("userScopeService")
  private userScopeService: UserScopeService;  

  private apiVersionRegex = new RegExp(API_VERSION_REGEX); 

  private pathParamRegex  = new RegExp(PATH_PARAM_REGEX); 
  
  public setApiScopeService(apiScopeService:ApiScopeService):void {
    this.apiScopeService = apiScopeService;
  }
  
  public setUserScopeService(userScopeService:UserScopeService):void {
    this.userScopeService = userScopeService;
  }


  public async validateUserAcess(userEmail:string, api:string, verb:string): Promise<boolean> {
    scopeLogger.debug(`method validateUserAcess has initialized. Parameters: userEmail[${userEmail}, api[[${api}] e verb[${verb}]].`);
    this.validateParametersScope(userEmail, api, verb);
    const resultUser = await this.userScopeService.getBackScopes(userEmail);    
    const resultApi = await this.apiScopeService.getScopes(this.verifyApiPathParam(api), verb);
    // verifica se o usuario possui a scope necessaria para acessar a api.
    const isAccess = resultApi.some(element => resultUser.includes(element));      
    
    const valueIsAccess = String(isAccess);
    scopeLogger.info(`Does userEmail[${userEmail}] have permissions to access this api: api[${api}] verb[~${verb}]? ${valueIsAccess}`);
    scopeLogger.debug(`api's scopes: ${JSON.stringify(resultApi)}`);
    scopeLogger.debug(`user's scopes: ${JSON.stringify(resultUser)}`);
    scopeLogger.debug(`method validateUserAcess has finalized.`);
    return isAccess;    
  }

  public verifyApiPathParam(api:string):string {
    scopeLogger.debug(`verifyApiPathParam method has initialized. api[${api}]`);
    const arrayApi:string[] = api.split("/");
    let resultApi = "";
    let isAlreadyFindApiVersion = false;
    scopeLogger.info(`identify these nodes: ${JSON.stringify(arrayApi)}`);
    for (const element of arrayApi) {
      scopeLogger.debug(`processing this node: ${element}` )
      if (element == "") {
        continue;
      }

      if (this.apiVersionRegex.test(element)) {
        scopeLogger.debug(`element has apiVersion format: ${element}`);
        if (!isAlreadyFindApiVersion) {
          scopeLogger.debug(`first time of the apiVersion format.`);
          isAlreadyFindApiVersion = true;
          resultApi = resultApi + SLASH + element;          
        } else {
          scopeLogger.debug(`second time of the apiVersion format.`);
          resultApi = resultApi + SLASH + PATH_PARAM_IDENTIFIER;          
        }
        continue;
      } 

      if (this.pathParamRegex.test(element)) {
        scopeLogger.info(`element has a path param format. Converted of ${element} for #{}`);
        resultApi = resultApi + SLASH + PATH_PARAM_IDENTIFIER;
        continue;        
      }

      resultApi = resultApi + SLASH + element;
      scopeLogger.debug(`element has a normal format.`);
      scopeLogger.debug(`api formatted is: ${resultApi}`);
    }
    scopeLogger.info(`it has finalized convertPathParam. Original: ${api} - Converted: ${resultApi}`);
    return resultApi;
  }  

  
  private validateParametersScope(userEmail:string, api: string, verb: string) {
    if (isNullOrWhitespace(api)) {
        scopeLogger.error("api parameter is required");
        throw new IllegalArgumentException("api parameter is required");
    }

    if (isNullOrWhitespace(verb)) {
        scopeLogger.error("verb parameter is required");
        throw new IllegalArgumentException("verb parameter is required");
    }

    if (isNullOrWhitespace(userEmail)) {
      scopeLogger.error("userEmail parameter is required");
      throw new IllegalArgumentException("userEmail parameter is required");
    }
}

}