import { UserScopeRepository } from "../src/repositories/UserScopeRepository";
import { IllegalArgumentException, ResourceNotFoundException, IllegalArgumentMessageQueueException } from "../src/errors/SecurityErrors";
import { UserScopeService } from "../src/services/UserScopeService";
import { UserScope } from "../src/entities/UserScope";


describe('UserScopeService', () => {


  const userScopeService = new UserScopeService();
  const userScopeRepository = new UserScopeRepository();
  userScopeService.setUserScopeRepository(userScopeRepository);



  beforeEach(() => {
    jest.resetAllMocks();
  });




  // METHOD getFrontScopesByUser
  describe("getFrontScopes", () => {

    it("should list all frontScopes", async () => {

      const resultMock: number[] = [4, 2];
      userScopeRepository.getFrontScopesByUser = jest.fn().mockResolvedValue(resultMock);
      const result = await userScopeService.getFrontScopes("test@test.com");
      expect(result).toEqual(resultMock);

    });

    it("should validate userEmail parameter is required", async () => {

      let isExpectedErr = false;
      try {
        await userScopeService.getFrontScopes(null);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("userEmail parameter is required");
      }
      expect(isExpectedErr).toEqual(true);

    });

  });

  // METHOD getFrontScopesByUser
  describe("getBackScopes", () => {

    it("should list all backScopes", async () => {

      const resultMock: number[] = [4, 2];
      userScopeRepository.getBackScopesByUser = jest.fn().mockResolvedValue(resultMock);
      const result = await userScopeService.getBackScopes("test@test.com");
      expect(result).toEqual(resultMock);

    });

    it("should validate userEmail parameter is required", async () => {

      let isExpectedErr = false;
      try {
        await userScopeService.getBackScopes(null);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("userEmail parameter is required");
      }
      expect(isExpectedErr).toEqual(true);

    });

  });

  describe("delete", () => {

    it("should delete successfully", async () => {

      const userScope = { operation: "delete", userEmail: "teste" } as UserScope;
      userScopeRepository.delete = jest.fn().mockReturnThis();
      await userScopeService.delete(userScope);

    });


    it("should validate userScope parameter is null", async () => {

      let isExpectedErr = false;
      try {
        await userScopeService.delete(null);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentException;
        expect(error.message).toBe("userScope parameter is null or empty.");
      }

    });

    it("should validate userEmail is null", async () => {

      let isExpectedErr = false;
      try {
        const userScope = { operation: "delete" } as UserScope;
        await userScopeService.delete(userScope);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
        expect(error.message).toBe("userEmail field is null or empty.");
      }

    });

  });

    describe("updateInsert", () => {

      it("should put successfully", async () => {

        const userScope = { operation: "put", userEmail: "teste", frontScopes: [4, 2], backScopes: [4, 3] } as UserScope;
        userScopeRepository.updateInsert = jest.fn().mockReturnThis();
        await userScopeService.updateInsert(userScope);

      });


      it("should validate userScope parameter is null", async () => {

        let isExpectedErr = false;
        try {
          await userScopeService.updateInsert(null);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentException;
          expect(error.message).toBe("userScope parameter is null or empty.");
        }

      });

      it("should validate userEmail is null", async () => {

        let isExpectedErr = false;
        try {
          const userScope = { operation: "put" } as UserScope;
          await userScopeService.updateInsert(userScope);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
          expect(error.message).toBe("userEmail field is null or empty.");
        }

      });

      it("should validate frontScope is undefined", async () => {

        let isExpectedErr = false;
        try {
          const userScope = { operation: "put", userEmail: "teste", backScopes: [4, 3] } as UserScope;
          await userScopeService.updateInsert(userScope);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
          expect(error.message).toBe("frontScopes field is undefined.");
        }

      });

      it("should validate backScope is undefined", async () => {

        let isExpectedErr = false;
        try {
          const userScope = { operation: "put", userEmail: "teste", frontScopes: [4, 3] } as UserScope;
          await userScopeService.updateInsert(userScope);
        } catch (error) {
          isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
          expect(error.message).toBe("backScopes field is undefined.");
        }

      });



    });

    // public async delete(userScope:UserScope): Promise<void> {
    //   consumerLogger.debug(`method delete has initialized. Parameters: userScope[${userScope.userEmail}]`);
    //   if (userScope == null) {
    //     throw new IllegalArgumentException(`userScope parameter is null or empty.`);
    //   } 
    //   this.validateUserEmail(userScope);
    //   consumerLogger.debug(`method delete has finalized.`);
    //   return await this.userScopeRepository.delete(userScope);
    // }


  });
