import { UserScopeRepository } from "../src/repositories/UserScopeRepository";
import dynamoDb from 'aws-sdk/clients/dynamodb';
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { IllegalArgumentException, ResourceNotFoundException } from "../src/errors/SecurityErrors";
import { UserScope } from "../src/entities/UserScope";





describe('UserScopeRepository', () => {


    const userScopeRepository = new UserScopeRepository();
    AWSMock.setSDKInstance(AWS);
    process.env.environment = "dev";    

    beforeEach(() => {
        jest.resetAllMocks();      
        AWSMock.restore('DynamoDB.DocumentClient');
    });

    function prepararMockRetornoNormal() {
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            console.log('DynamoDB.DocumentClient', 'get', 'mock called');
            callback(null, { 
                Item: {
                  userEmail: 'teste@test.com.br',
                  frontScopes: [2],
                  backScopes: [4]
                }
            });
        });                
        const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        userScopeRepository.setDocumentClient(docClient);
    }
    

    function prepararMockRetornoVazio() {
        
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            console.log('DynamoDB.DocumentClient', 'get', 'mock called');
            callback(null, {}
            );
        });                
        const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
        userScopeRepository.setDocumentClient(docClient);
    }

    function prepararMockDeleteOk() {
        
      AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params: GetItemInput, callback: Function) => {
          console.log('DynamoDB.DocumentClient', 'delete', 'mock called');
          callback(null, {}
          );
      });                
      const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
      userScopeRepository.setDocumentClient(docClient);
  }

  function prepararMockPutOk() {
        
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: GetItemInput, callback: Function) => {
        console.log('DynamoDB.DocumentClient', 'put', 'mock called');
        callback(null, {}
        );
    });                
    const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
    userScopeRepository.setDocumentClient(docClient);
}
    

    // METHOD getFrontScopesByUser
    describe("getFrontScopesByUser", () => {

        it("should list all backScopes", async () => {
            prepararMockRetornoNormal();
            const result:number[] = await userScopeRepository.getFrontScopesByUser("teste@test.com.br");
            expect(result).toEqual([2]); 
            AWSMock.restore('DynamoDB.DocumentClient');
        });

        it("should throw an ResourceNotFound", async () => {             
            
            let isExpectedErr = false;
             try {
                prepararMockRetornoVazio();           
                await userScopeRepository.getFrontScopesByUser("teste@teste.com");                
               } catch (error) {
                 isExpectedErr = error instanceof ResourceNotFoundException;                 
                 expect(error.message).toBe("userscope [teste@teste.com] not found.");
               }   
               expect(isExpectedErr).toEqual(true);
            
        });

        it("should throw an illegalArgumentException", async () => {            
           try {
                await userScopeRepository.getFrontScopesByUser(null);                
              } catch (error) {
                let isExpectedErr = error instanceof IllegalArgumentException;
                expect(isExpectedErr).toBeTruthy();
                expect(error.message).toBe("userEmail parameter is required");
              }          
        });


    });

    describe("getBackScopesByUser", () => {
        it("should list all backScopes", async () => {            
            prepararMockRetornoNormal();
            const result:number[] = await userScopeRepository.getBackScopesByUser("teste@test.com.br");
            expect(result).toEqual([4]);  
        });

        it("should throw an illegalArgumentException", async () => {            
            try {
                 userScopeRepository.getBackScopesByUser(null);                
               } catch (error) {
                 let isExpectedErr = error instanceof IllegalArgumentException;
                 expect(isExpectedErr).toBeTruthy();
                 expect(error.message).toBe("userEmail parameter is required");
               }          
         });

         it("should throw an ResourceNotFound", async () => { 
            let isExpectedErr = false;
             try {
                prepararMockRetornoVazio();           
                await userScopeRepository.getBackScopesByUser("teste@teste.com");                
               } catch (error) {
                 isExpectedErr = error instanceof ResourceNotFoundException;                 
                 expect(error.message).toBe("userscope [teste@teste.com] not found.");
               }   
               expect(isExpectedErr).toEqual(true);
               
         });
    });

    describe("delete", () => {
      it("should delete successfully", async () => {            
          prepararMockDeleteOk();
          const userScope = {operation: "delete", userEmail: "teste"} as UserScope;        
          await userScopeRepository.delete(userScope);          
      });
    });

    describe("put", () => {
      it("should put successfully", async () => {            
          prepararMockPutOk();
          const userScope = {operation: "put", userEmail: "teste", frontScopes: [4,2], backScopes: [4,3]} as UserScope;        
          await userScopeRepository.updateInsert(userScope);          
      });
    });

    //   interface UserScope {
        //     operation: string,
        //     userEmail: string,
        //     frontScopes: number[],
        //     backScopes: number[]
        // }

});

