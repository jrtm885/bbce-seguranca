import { Request, Response } from "express";
import { UserScopeController } from "../src/controllers/UserScopeController";
import dynamoDb from 'aws-sdk/clients/dynamodb';
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { IllegalArgumentException, ResourceNotFoundException } from "../src/errors/SecurityErrors";
import { UserScopeService } from "../src/services/UserScopeService";


describe('UserScopeController', () => {


  const userScopeService = new UserScopeService();
  const userScopeController = new UserScopeController();
  userScopeController.setScopeService(userScopeService);

  const req = {} as Request;
  const res = {} as Response;


  beforeEach(() => {
    jest.resetAllMocks();
    res.status = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
  });




  // METHOD getFrontScopesByUser
  describe("getScopes", () => {

    it("should list all frontScopes", async () => {
      req.query = { userEmail: "test@test.com" };
      const result: number[] = [4, 2];
      userScopeService.getFrontScopes = jest.fn().mockResolvedValue(result);
      await userScopeController.getScopes(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it("should throw ResourceNotFoundException because it didn't find an userscope", async () => {
      userScopeService.getFrontScopes = jest
        .fn()
        .mockRejectedValue(new ResourceNotFoundException("userscope [test@test.com] not found."));
      req.query = { userEmail: "test@test.com" };
      await userScopeController.getScopes(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "userscope [test@test.com] not found." });
    });

    it("should throw ResourceNotFoundException because it didn't find an userscope", async () => {
      userScopeService.getFrontScopes = jest
        .fn()
        .mockRejectedValue(new ResourceNotFoundException("userscope [test@test.com] not found."));
      req.query = { userEmail: "test@test.com" };
      await userScopeController.getScopes(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "userscope [test@test.com] not found." });
    });

    it("should throw IllegalArgumentException because service didn't received an email parameter.", async () => {
      userScopeService.getFrontScopes = jest
        .fn()
        .mockRejectedValue(new IllegalArgumentException("userEmail parameter is required"));
      req.query = { userEmail: "test@test.com" };
      await userScopeController.getScopes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal error." });
    });

    it("should throw an unexpected error ", async () => {
      userScopeService.getFrontScopes = jest
        .fn()
        .mockRejectedValue(new Error());
      req.query = { userEmail: "test@test.com" };
      await userScopeController.getScopes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal error." });
    });

    it("should validate userEmail parameter invalid.", async () => {

      req.query = {};
      await userScopeController.getScopes(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "userEmail parameter is required." });
    });

  });


});

