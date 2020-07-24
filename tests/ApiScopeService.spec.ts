import { ApiScopeRepository } from "../src/repositories/ApiScopeRepository";
import { IllegalArgumentException, ResourceNotFoundException, IllegalArgumentMessageQueueException } from "../src/errors/SecurityErrors";
import { ApiScopeService } from "../src/services/ApiScopeService";
import { ApiScope } from "../src/entities/ApiScope";


describe('ApiScopeController', () => {


  const apiScopeService = new ApiScopeService();
  const apiScopeRepository = new ApiScopeRepository();
  apiScopeService.setApiScopeRepository(apiScopeRepository);
  
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // METHOD getFrontScopesByUser
  describe("getScopes", () => {

    it("should list all scopes", async () => {

      const resultMock: number[] = [4, 2];
      apiScopeRepository.getScopes = jest.fn().mockResolvedValue(resultMock);
      const result = await apiScopeService.getScopes("/security/v1/user_scopes", "GET");
      expect(result).toEqual(resultMock);

    });

    it("should validate api parameter is required, sent white space", async () => {

      let isExpectedErr = false;
      try {
        await apiScopeService.getScopes(" ", "GET");
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("api parameter is required");
      }
      expect(isExpectedErr).toEqual(true);

    });

    it("should validate api parameter is required, sent null", async () => {

      let isExpectedErr = false;
      try {
        await apiScopeService.getScopes(null, "GET");
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("api parameter is required");
      }
      expect(isExpectedErr).toEqual(true);

    });

    it("should validate verb parameter is required, sent white space", async () => {

      let isExpectedErr = false;
      try {
        await apiScopeService.getScopes("/security/v1/user_scope", "");
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("verb parameter is required");
      }
      expect(isExpectedErr).toEqual(true);

    });

    it("should validate api parameter is required, sent null", async () => {

      let isExpectedErr = false;
      try {
        await apiScopeService.getScopes("/security/v1/user_scope", null);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("verb parameter is required");
      }
      expect(isExpectedErr).toEqual(true);

    });

    it("should validate api parameter is required, sent api null and verb white space", async () => {

      let isExpectedErr = false;
      try {
        await apiScopeService.getScopes(" ", null);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("api parameter is required");
      }
      expect(isExpectedErr).toEqual(true);

    });

  });

  describe("delete", () => {

    it("should delete successfully", async () => {

      const userScope = { operation: "delete", api: "teste", verb: "GET" } as ApiScope;
      apiScopeRepository.delete = jest.fn().mockReturnThis();
      await apiScopeService.delete(userScope);

    });


    it("should validate apiScope parameter is null", async () => {

      let isExpectedErr = false;
      try {
        await apiScopeService.delete(null);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("apiScope parameter is null or empty.");
      }

    });

    it("should validate api is null", async () => {

      let isExpectedErr = false;
      try {
        const apiScope = { operation: "delete", verb: "GET" } as ApiScope;
        await apiScopeService.delete(apiScope);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
        expect(error.message).toBe("api field is null or empty.");
      }

    });

    it("should validate verb is null", async () => {

      let isExpectedErr = false;
      try {
        const apiScope = { operation: "delete", api: "teste" } as ApiScope;
        await apiScopeService.delete(apiScope);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
        expect(error.message).toBe("verb field is null or empty.");
      }

    });

  });

    describe("updateInsert", () => {

      it("should put successfully", async () => {

        const userScope = { operation: "put", api: "teste", verb: "GET", scopes: [1,2,3] } as ApiScope;
        apiScopeRepository.updateInsert = jest.fn().mockReturnThis();
        await apiScopeService.updateInsert(userScope);

      });


      it("should validate api parameter is null", async () => {

        let isExpectedErr = false;
        try {
          await apiScopeService.updateInsert(null);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentException;
          expect(error.message).toBe("apiScope parameter is null or empty.");
        }

      });

      it("should validate api is null", async () => {

        let isExpectedErr = false;
        try {
          const apiScope = { operation: "put", verb: "GET" } as ApiScope;
          await apiScopeService.updateInsert(apiScope);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
          expect(error.message).toBe("api field is null or empty.");
        }

      });

      it("should validate verb is null", async () => {

        let isExpectedErr = false;
        try {
          const apiScope = { operation: "put", api: "teste" } as ApiScope;
          await apiScopeService.updateInsert(apiScope);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
          expect(error.message).toBe("verb field is null or empty.");
        }

      });

      it("should validate scopes is undefined", async () => {

        let isExpectedErr = false;
        try {
          const apiScope = { operation: "put", api: "teste", verb: "GET" } as ApiScope;
          await apiScopeService.updateInsert(apiScope);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
          expect(error.message).toBe("scopes field is undefined.");
        }

      });

      it("should validate scopes is undefined", async () => {

   
          const apiScope = { operation: "put", api: "teste", verb: "GET", scopes: [] } as ApiScope;
          await apiScopeService.updateInsert(apiScope);
       

      });

    


    });

});

