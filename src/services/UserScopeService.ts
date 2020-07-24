import { Service, Inject } from "typedi";
import { UserScopeRepository } from "../repositories/UserScopeRepository";
import { IllegalArgumentException, IllegalArgumentMessageQueueException } from "../errors/SecurityErrors";
import { scopeLogger, consumerLogger } from "../utils/LoggerUtil";
import { isNullOrWhitespace } from "../utils/Util";
import { UserScope } from "../entities/UserScope";

/**
 * Classe que possui as regras negociais referentes à UserScope.  
 */
@Service('userScopeService')
export class UserScopeService {

  @Inject("userScopeRepository")
  private userScopeRepository: UserScopeRepository;  
 
  public setUserScopeRepository(userScopeRepository:UserScopeRepository):void {
    this.userScopeRepository = userScopeRepository
  }

  /**
   * Recupera todos os escopos do front-end de determinado usuário.
   * @param userEmail Paramêtro obrigatório. Email do usuário para recuperar os scopes de frontend. 
   * @returns number[] contendo todos os escopos de front-end do usuário.
   * @throws IllegalArgumentException
   */
  public async getFrontScopes(userEmail: string): Promise<number[]> {
    scopeLogger.debug(`method getFrontScopes has initialized. Parameters: userEmail[${userEmail}]`);
    if (isNullOrWhitespace(userEmail)) {
      scopeLogger.error("userEmail parameter is required");
      throw new IllegalArgumentException("userEmail parameter is required");
    }
    scopeLogger.debug(`method getFrontScopes has finalized.`);
    return await this.userScopeRepository.getFrontScopesByUser(userEmail);
  }

  /**
   * Recupera todos os escopos do backend de determinado usuário.
   * @param userEmail Paramêtro obrigatório. Email do usuário para recuperar os scopes de backend. 
   * @returns number[] contendo todos os escopos de backend do usuário.
   * @throws IllegalArgumentException
   */
  public async getBackScopes(userEmail: string): Promise<number[]> {
    scopeLogger.debug(`method getBackScopes has initialized. Parameters: userEmail[${userEmail}]`);
    if (isNullOrWhitespace(userEmail)) {
      scopeLogger.error("userEmail parameter is required");
      throw new IllegalArgumentException("userEmail parameter is required");
    }
    scopeLogger.debug(`method getBackScopes has finalized.`);
    return await this.userScopeRepository.getBackScopesByUser(userEmail);
  }

  public async delete(userScope:UserScope): Promise<void> {
    if (userScope == null) {
      throw new IllegalArgumentException(`userScope parameter is null or empty.`);
    } 
    consumerLogger.debug(`method delete has initialized. Parameters: userScope[${userScope.userEmail}]`);
    this.validateUserEmail(userScope);
    consumerLogger.debug(`method delete has finalized.`);
    return await this.userScopeRepository.delete(userScope);
  }

  public async updateInsert(userScope:UserScope): Promise<void> {
    if (userScope == null) {
      throw new IllegalArgumentException(`userScope parameter is null or empty.`);
    } 
    consumerLogger.debug(`method updateInsert has initialized. Parameters: userScope[${userScope.userEmail}]`);
    this.validateUserEmail(userScope);
    this.validateUserScopeForInsertUpdate(userScope);    

    consumerLogger.debug(`method updateInsert has finalized.`);
    return await this.userScopeRepository.updateInsert(userScope);
  }

  private validateUserEmail(userScope: UserScope) {
    if (isNullOrWhitespace(userScope.userEmail)) {
      throw new IllegalArgumentMessageQueueException(`userEmail field is null or empty.`);
    }
    consumerLogger.debug(`userScope.userEmail is a valid parameter.`);
  }

  private validateUserScopeForInsertUpdate(userScope: UserScope) {    

      if (userScope.frontScopes == undefined)  {
        throw new IllegalArgumentMessageQueueException(`frontScopes field is undefined.`);
      }
      consumerLogger.debug(`userScope.frontScopes is a valid parameter.`);

      if (userScope.backScopes == undefined) {
        throw new IllegalArgumentMessageQueueException(`backScopes field is undefined.`);
      }
      consumerLogger.debug(`userScope.backScopes is a valid parameter.`);
    
  }

}