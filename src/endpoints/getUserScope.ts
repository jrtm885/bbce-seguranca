/* eslint-disable */
import { UserScopeController } from "../controllers/UserScopeController";
import { Container } from "typedi";
 
const controller = Container.get<UserScopeController>(UserScopeController);
exports.handler = controller.getScopes.bind(controller);