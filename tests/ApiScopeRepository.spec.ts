import { ApiScopeRepository } from "../src/repositories/ApiScopeRepository";
import dynamoDb from 'aws-sdk/clients/dynamodb';
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { IllegalArgumentException, ResourceNotFoundException } from "../src/errors/SecurityErrors";
import { ApiScope } from "../src/entities/ApiScope";





describe('ApiScopeRepository', () => {


    const apiScopeRepository = new ApiScopeRepository();
    AWSMock.setSDKInstance(AWS);
    

    beforeEach(() => {
        jest.resetAllMocks();      
        AWSMock.restore('DynamoDB.DocumentClient');
    });

    function prepararMockRetornoNormal() {
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            console.log('DynamoDB.DocumentClient', 'get', 'mock called');
            callback(null, { 
                Item: {
                  scopes: [4,2]
                }
            });
        });                
        const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        apiScopeRepository.setDocumentClient(docClient);
    }

    function prepararMockRetornoVazio() {
        
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            console.log('DynamoDB.DocumentClient', 'get', 'mock called');
            callback(null, {}
            );
        });                
        const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        apiScopeRepository.setDocumentClient(docClient);
    }

    function prepararMockDeleteOk() {
        
      AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params: GetItemInput, callback: Function) => {
          console.log('DynamoDB.DocumentClient', 'delete', 'mock called');
          callback(null, {}
          );
      });                
      const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
      apiScopeRepository.setDocumentClient(docClient);
  }

  function prepararMockPutOk() {
        
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: GetItemInput, callback: Function) => {
        console.log('DynamoDB.DocumentClient', 'put', 'mock called');
        callback(null, {}
        );
    });                
    const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    apiScopeRepository.setDocumentClient(docClient);
}
    

    // METHOD getFrontScopesByApi
    describe("getScopes", () => {

      it("should validate api parameter is required", async () => {            
        try {
             await apiScopeRepository.getScopes(" ", "GET");                
           } catch (error) {
             let isExpectedErr = error instanceof IllegalArgumentException;
             expect(isExpectedErr).toBeTruthy();
             expect(error.message).toBe("api parameter is required");
           }          
      });

      it("should validate verb parameter is required", async () => {            
        try {
             await apiScopeRepository.getScopes("/security/v1/user_scope", null);                
           } catch (error) {
             let isExpectedErr = error instanceof IllegalArgumentException;
             expect(isExpectedErr).toBeTruthy();
             expect(error.message).toBe("verb parameter is required");
           }          
      });

      it("should validate api parameter is required, sent both as null", async () => {            
        try {
             await apiScopeRepository.getScopes(null, " ");                
           } catch (error) {
             let isExpectedErr = error instanceof IllegalArgumentException;
             expect(isExpectedErr).toBeTruthy();
             expect(error.message).toBe("api parameter is required");
           }          
      });

        it("should list all backScopes", async () => {
            prepararMockRetornoNormal();
            const result:number[] = await apiScopeRepository.getScopes("/security/v1/user_scope", "GET");
            expect(result).toEqual([4,2]); 
            AWSMock.restore('DynamoDB.DocumentClient');
        });

        it("should throw an ResourceNotFound because didn't find an apiscopes", async () => {             
            
            let isExpectedErr = false;
             try {
                prepararMockRetornoVazio();           
                await apiScopeRepository.getScopes("/security/v1/user_scope", "GET");
               } catch (error) {
                 isExpectedErr = error instanceof ResourceNotFoundException;                 
                 expect(error.message).toBe("apiscope [[/security/v1/user_scope] e [GET]] not found.");
               }   
               expect(isExpectedErr).toEqual(true);
            
        });

    });

    describe("delete", () => {
      it("should delete successfully", async () => {            
          prepararMockDeleteOk();
          const apiScope = {operation: "delete", api: "teste", verb: "GET"} as ApiScope;
          await apiScopeRepository.delete(apiScope);          
      });
    });

    describe("put", () => {
      it("should put successfully", async () => {            
          prepararMockPutOk();
          const apiScope = {operation: "put", api: "teste", verb: "GET", scopes: [4,2]} as ApiScope;        
          await apiScopeRepository.updateInsert(apiScope);          
      });
    });

});

