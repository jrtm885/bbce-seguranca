import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import { scopeLogger } from '../utils/LoggerUtil';
import { AccessService } from "../services/AccessService";
import { ResourceNotFoundException, InvalidTokenException } from "../errors/SecurityErrors";
import { IllegalArgumentException } from "../errors/SecurityErrors";
import { getEmailFromToken } from "../utils/Util";


interface Endpoint {
    api: string;
    verb: string;
}

@Service('accessController')
export class AccessController {

    @Inject("accessService")
    private accessService: AccessService;

    public async validateAccess(req: Request, res: Response): Promise<void> {
        scopeLogger.debug("method validateAccess has initialized.");        

        try {       
     
            const userEmail = getEmailFromToken(req.get("Authorization")); 
            
            const { api, verb } = req.body as Endpoint;
                        
            const result = await this.accessService.validateUserAcess(userEmail, api, verb);
            
            if (result) {
                res.status(200).json({"access" : result, "message" : "Acesso permitido."});
            } else {
                res.status(200).json({"access" : result, "message" : `Usuário [${userEmail}] não possui acesso à api ${verb} ${api}`});
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof IllegalArgumentException) {
                res.status(500).json({ message: error.message });
            } else if (error instanceof InvalidTokenException) {
                res.status(500).json({ message: error.message });
            }else {
                scopeLogger.error(`ocurred an exception: ${Error(error).message}`);
                res.status(500).json({ message: (error as Error).message });
            }
        }        
    }

    public setAccessService(accessService: AccessService): void {
        this.accessService = accessService;
    }

}