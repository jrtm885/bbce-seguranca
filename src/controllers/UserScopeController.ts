import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import { scopeLogger } from '../utils/LoggerUtil';
import { UserScopeService } from "../services/UserScopeService";
import { ResourceNotFoundException } from "../errors/SecurityErrors";
import { IllegalArgumentException } from "../errors/SecurityErrors";


@Service('userScopeController')
export class UserScopeController {

    @Inject("userScopeService")
    private userScopeService: UserScopeService;

    public async getScopes(req: Request, res: Response): Promise<void> {
        scopeLogger.debug("method getScopes has initialized.");
        try {
            const userEmail = req.query.userEmail as string;
            // const userEmail = req.query.userEmail.toString();
            if (userEmail == null) {
                res.status(400).json({ message: "userEmail parameter is required." });
                return;
            }
            scopeLogger.debug(`this parameter has sended: userEmail[${userEmail}]`);
            const scopes = await this.userScopeService.getFrontScopes(userEmail.toString());
            res.status(200).json(scopes);
        } catch (error) {
            if (error instanceof ResourceNotFoundException) {
                res.status(404).json({ message: error.message });
            } else if (error instanceof IllegalArgumentException) {
                res.status(500).json({ message: "Internal error." });
            } else {
                scopeLogger.error(`ocurred an exception: ${Error(error).message}`);
                res.status(500).json({ message: "Internal error." });
            }
        }
    }

    public setScopeService(userScopeService: UserScopeService): void {
        this.userScopeService = userScopeService;
    }


}