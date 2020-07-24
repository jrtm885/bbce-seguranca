import { Container } from "typedi";

import { UserScopeConsumer } from "./src/consumers/UserScopeConsumer";
import { ApiScopeConsumer } from "./src/consumers/ApiScopeConsumer";
import { UserScopeService } from "./src/services/UserScopeService";
import { ApiScopeService } from "./src/services/ApiScopeService";

const userScopeService = Container.get<UserScopeService>(UserScopeService);
Container.set("userScopeConsumer", new UserScopeConsumer(null, userScopeService));

const apiScopeService = Container.get<ApiScopeService>(ApiScopeService);
Container.set("apiScopeConsumer", new ApiScopeConsumer(null, apiScopeService));
