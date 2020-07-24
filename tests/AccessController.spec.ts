import { Request, Response } from "express";
import { AccessController } from "../src/controllers/AccessController";
import dynamoDb from 'aws-sdk/clients/dynamodb';
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { IllegalArgumentException, ResourceNotFoundException, InvalidTokenException } from "../src/errors/SecurityErrors";
import { AccessService } from "../src/services/AccessService";


describe('AccessController', () => {


  const accessService = new AccessService();
  const accessController = new AccessController();
  accessController.setAccessService(accessService);

  const token = "Bearer eyJraWQiOiJFdTc3WXNaRTRHUmd1NERRXC9KN2ZXN3VqUTNhR2xcL2w5K2FEZTdQdWc5SGc9IiwiYWxnIjoiUlMyNTYifQ.eyJhdF9oYXNoIjoiZkMwS3FSWkZHclcwYS1wMXUxd3p3USIsInN1YiI6IjU0MGVkODI2LTIyZTEtNDlhYS1iYTJlLWZhNTZhNGQ2YjRiNCIsImF1ZCI6IjN1ODZpbWc0MG5maGJjcTdyOHEyN2ZqZGsyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV2ZW50X2lkIjoiMTdlZWQyMjAtOGIyMS00Mjg1LWIwZDMtNzI0MTZiMTFjM2YyIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1OTI1OTA1NTQsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX09BaEhLVnNFYSIsImNvZ25pdG86dXNlcm5hbWUiOiI1NDBlZDgyNi0yMmUxLTQ5YWEtYmEyZS1mYTU2YTRkNmI0YjQiLCJleHAiOjE1OTI1OTQxNTQsImlhdCI6MTU5MjU5MDU1NCwiZW1haWwiOiJqb25hdGhhbi50Lm1hcnRpbmV6QGdtYWlsLmNvbSJ9.V1YD9iCgedrFPtZzC_B4PU3kLVQ1bvJN4GHphiLctH7mGWs1uGnhMDLbra_S18maQXAlBwt-iJJqwX1K7SnwinWK3bzIIIS8MgxUq0cJhPbk--SxdNHvOzxFCZ0dvkWZTcYnu2fMGbNaLI8GtDEHYWauUX6X0cnRQAT6wDfDyfmolz9wCCQVMMfQE8qZUk-XR8ikhSOV1Sr0NsvSElj6XAmeVZPi6kVnpGk-ZZf-Itha4ixHJo-v4Yh5-8jV8N8Cx7f_vTsNYbn4EEpb6yfsrhK2cEPH190uKD-ktdIACtBFfOKakzbLZGxfyhXiWIaK34ifx7F3e_FThynXT8tf2w"

  
  const res = {} as Response;


  beforeEach(() => {
    jest.resetAllMocks();
    res.status = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
  });




  // METHOD getFrontScopesByUser
  describe("validateAccess", () => {

    it("should allow access", async () => {
      const req: any = {
        get: jest.fn((name) => {
          if (name === 'Authorization') return token;
        })
      };
      req.body = {
          "api": "/security/v1/user_scope",
          "verb": "GET"
        }           
       
      accessService.validateUserAcess = jest.fn().mockResolvedValue(true);
      const result = await accessController.validateAccess(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({"access" : true, "message" : "Acesso permitido."});
    });

    it("should validate accessToken null: invalid Token", async () => {
      const req: any = {
        get: jest.fn((name) => {
          if (name === 'Authorization') return null;
        })
      };
      req.body = {
          "api": "/security/v1/user_scope",
          "verb": "GET"
        }           
       
      accessService.validateUserAcess = jest.fn().mockResolvedValue(false);
      const result = await accessController.validateAccess(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({message: "Invalid Token."});
    });
    it("shouldn't allow access", async () => {
      
      const req: any = {
        get: jest.fn((name) => {
          if (name === 'Authorization') return token;
        })
      };
      req.body = {
          "api": "/security/v1/user_scope",
          "verb": "GET"
        } 
        accessService.validateUserAcess = jest.fn().mockResolvedValue(false);
    const result = await accessController.validateAccess(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({"access" : false, "message" : `Usuário [jonathan.t.martinez@gmail.com] não possui acesso à api GET /security/v1/user_scope`});
    });

    it("should validate api parameter is null", async () => {
      
      const req: any = {
        get: jest.fn((name) => {
          if (name === 'Authorization') return token;
        })
      };
      req.body = {          
          "verb": "GET"
        } 
        accessService.validateUserAcess = jest
        .fn()
        .mockRejectedValue(new IllegalArgumentException("api parameter is required"));
        
    const result = await accessController.validateAccess(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "api parameter is required"});
    });

    it("should validate verb parameter is null", async () => {
      
      const req: any = {
        get: jest.fn((name) => {
          if (name === 'Authorization') return token;
        })
      };
      req.body = {    
          "api": "/security/v1/user_scope",                
        } 
        accessService.validateUserAcess = jest
        .fn()
        .mockRejectedValue(new IllegalArgumentException("verb parameter is required"));
        
    const result = await accessController.validateAccess(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "verb parameter is required"});
    });

    it("should validate ResourceNotFound.", async () => {
      
      const req: any = {
        get: jest.fn((name) => {
          if (name === 'Authorization') return token;
        })
      };
      req.body = {    
          "api": "/security/v1/user_scope",                
        } 
        accessService.validateUserAcess = jest
        .fn()
        .mockRejectedValue(new ResourceNotFoundException("userscope [jonathan.t.martinez@gmail.com] not found."));
        
    const result = await accessController.validateAccess(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "userscope [jonathan.t.martinez@gmail.com] not found."});
    });

    it("should handle error generic.", async () => {
      
      const req: any = {
        get: jest.fn((name) => {
          if (name === 'Authorization') return token;
        })
      };
      req.body = {    
          "api": "/security/v1/user_scope", 
          "verb": "GET"               
        } 
        accessService.validateUserAcess = jest
        .fn()
        .mockRejectedValue(new Error("error test"));
        
    const result = await accessController.validateAccess(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    // expect(res.json).toHaveBeenCalledWith({ message: "Internal error."});
    });
  });


});

