import * as jwt from "jwt-simple";
import { SPACE } from "../SecurityConstants";
import { scopeLogger } from "./LoggerUtil";
import { InvalidTokenException } from "../errors/SecurityErrors";

export function isNullOrWhitespace(input: string):boolean {
    return !input || !input.trim();
}

interface JWTTokenParams {
    email: string
}

export function getEmailFromToken(fullToken: string):string {
    if (isNullOrWhitespace(fullToken)) {
        scopeLogger.error(`parametro fullToken é nulo ou vazio: ${fullToken}`);
        throw new InvalidTokenException("Invalid Token.");
    }
    const token = fullToken.split(SPACE)[1];
    if (isNullOrWhitespace(token)) {
        scopeLogger.error(`token esta corrompido: ${token}`);
        throw new InvalidTokenException("Invalid Token.");
    }

    // o token está sendo verificado no sidecar do istio. Se chegou até aqui é porque é um token válido.
    const decoded = jwt.decode(token, null, true) as JWTTokenParams;
    const email = decoded.email;    

    if (isNullOrWhitespace(email)) {
        scopeLogger.error(`Não foi possível encontrar o email no token recebido.`);
        throw new InvalidTokenException("Invalid Token. email not found.");
    }

    return email;
}