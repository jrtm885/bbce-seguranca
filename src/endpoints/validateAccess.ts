/* eslint-disable */
import { AccessController } from "../controllers/AccessController";
import { Container } from "typedi";
 
const controller = Container.get<AccessController>(AccessController);
exports.handler = controller.validateAccess.bind(controller);