import { AccessService } from "../src/services/AccessService";
import { IllegalArgumentException, ResourceNotFoundException } from "../src/errors/SecurityErrors";
import { ApiScopeService } from "../src/services/ApiScopeService";
import { UserScopeService } from "../src/services/UserScopeService";


describe('UserScopeController', () => {


  const accessService = new AccessService();

  const apiScopeService = new ApiScopeService(); 
  const userScopeService = new UserScopeService();

  accessService.setApiScopeService(apiScopeService);
  accessService.setUserScopeService(userScopeService);
  
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("validateUserAcess", () => {
    it("should identify that the user is allow to access an api.", async () => { 
      const userBackScopes = [1,2,3,4];
      userScopeService.getBackScopes = jest.fn().mockResolvedValue(userBackScopes);
      const apiBackScopes = [5,3];
      apiScopeService.getScopes = jest.fn().mockResolvedValue(apiBackScopes);
      const emailUser = "test@test.com"
      const isAccess = await accessService.validateUserAcess(emailUser, "/security/v1/users", "GET");
      expect(isAccess).toEqual(true);
    });
  });

  describe("validateUserAcess", () => {
    it("should identify that the user is not allow to access an api.", async () => { 
      const userBackScopes = [1,2,3,4];
      userScopeService.getBackScopes = jest.fn().mockResolvedValue(userBackScopes);
      const apiBackScopes = [5];
      apiScopeService.getScopes = jest.fn().mockResolvedValue(apiBackScopes);
      const emailUser = "test@test.com"
      const isAccess = await accessService.validateUserAcess(emailUser, "/security/v1/users", "GET");
      expect(isAccess).toEqual(false);
    });

    it("should validate userEmail parameter is required", async () => {
      // userEmail:string, api: string, verb: string
      let isExpectedErr = false;
      try {
        const isAccess = await accessService.validateUserAcess(null, "/security/v1/users", "GET");
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("userEmail parameter is required");
      }
      expect(isExpectedErr).toEqual(true);
      
    });

    it("should validate api parameter is required", async () => {
      // userEmail:string, api: string, verb: string
      let isExpectedErr = false;
      try {
        const isAccess = await accessService.validateUserAcess("test@test.com", "  ", "GET");
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("api parameter is required");
      }
      expect(isExpectedErr).toEqual(true);
      
    });

    it("should validate verb parameter is required", async () => {
      // userEmail:string, api: string, verb: string
      let isExpectedErr = false;
      try {
        const isAccess = await accessService.validateUserAcess("test@test.com", "/security/v1/users", "");
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("verb parameter is required");
      }
      expect(isExpectedErr).toEqual(true);
      
    });


  });

  // METHOD getFrontScopesByUser
  describe("convertPathParam", () => {
    it("should identify path parameter with letter and number: /as10101", async () => {             
    const resultApi = accessService.verifyApiPathParam("/security/v1/users/as10101");
    expect(resultApi).toEqual("/security/v1/users/#{}");
    });

    it("should identify path parameter with number: /1000", async () => {             
      const resultApi = accessService.verifyApiPathParam("/security/v1/users/1000");
      expect(resultApi).toEqual("/security/v1/users/#{}");
    });

    it("should identify 2 path parameter with number and letter and number: /1000 e /asdf22", async () => {             
      const resultApi = accessService.verifyApiPathParam("/security/v1/users/1000/asdf22");
      expect(resultApi).toEqual("/security/v1/users/#{}/#{}");
    });

    it("should identify normal api : /security/v1/users/scopes", async () => {             
      const resultApi = accessService.verifyApiPathParam("/security/v1/users/scopes");
      expect(resultApi).toEqual("/security/v1/users/scopes");
    });

    it("should identify path parameter with api version format: /security/v1/users/v1", async () => {             
      const resultApi = accessService.verifyApiPathParam("/security/v1/users/v1");
      expect(resultApi).toEqual("/security/v1/users/#{}");
    });

    it("should identify path parameter number and without api version : /security/users/1000", async () => {             
      const resultApi = accessService.verifyApiPathParam("/security/users/1000");
      expect(resultApi).toEqual("/security/users/#{}");
    });

  });
    
});

