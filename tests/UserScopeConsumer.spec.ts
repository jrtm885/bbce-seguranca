import { Request, Response } from "express";
import { UserScopeConsumer } from "../src/consumers/UserScopeConsumer";
import dynamoDb from 'aws-sdk/clients/dynamodb';
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { IllegalArgumentException, ResourceNotFoundException, InvalidTokenException, IllegalArgumentMessageQueueException } from "../src/errors/SecurityErrors";
import { AccessService } from "../src/services/AccessService";
import { Consumer } from "sqs-consumer";
import { UserScopeService } from "../src/services/UserScopeService";
import { SQS } from "aws-sdk";


describe('UserScopeConsumer', () => {


  
  const consumer = {} as Consumer;
  const userScopeService:UserScopeService = new UserScopeService();
  let userScopeConsumer:UserScopeConsumer = null;


  beforeEach(() => {
    jest.resetAllMocks();
    consumer.start = jest.fn().mockReturnThis();    
  });

  // METHOD getFrontScopesByUser
  describe("initialize userscope consumer", () => {

    it("should read a message with put operation", async () => {
      userScopeConsumer = new UserScopeConsumer(consumer, userScopeService);
      const message = {MessageId: "id123", Body : "{\"operation\": \"put\", \"userEmail\": \"teste2\", \"frontScopes\": [3,2,1], \"backScopes\": [3,2,1]}" }
      const messages = [message];      
      userScopeService.updateInsert =  jest.fn().mockReturnThis();      
      await userScopeConsumer.handlerMessages(messages);
    });

    it("should read a message with put operation", async () => {
      userScopeConsumer = new UserScopeConsumer(consumer, userScopeService);
      const message = {MessageId: "id123", Body : "{\"operation\": \"put\", \"userEmail\": \"teste2\", \"frontScopes\": [3,2,1], \"backScopes\": [3,2,1]}" }    
      userScopeService.updateInsert =  jest.fn().mockReturnThis();      
      userScopeConsumer.convertAndValidateMessageFields(message);
    });

    it("should read a message with delete operation", async () => {
      userScopeConsumer = new UserScopeConsumer(consumer, userScopeService);
      const message = {MessageId: "id123", Body : "{\"operation\": \"delete\", \"userEmail\": \"teste2\"}" }
      const messages = [message];      
      userScopeService.delete =  jest.fn().mockReturnThis();
      await userScopeConsumer.handlerMessages(messages);
    });

    

    it("should validate operation parameter is null.", async () => {  
        userScopeConsumer = new UserScopeConsumer(consumer, userScopeService);
        const message = {MessageId: "id123", Body : "{\"operation\": \" \", \"userEmail\": \"teste2\"}" }
        const messages = [message];      
        userScopeConsumer.handlerMessages(messages);       
    });

    it("should validate operation parameter has an invalid value.", async () => {  
      userScopeConsumer = new UserScopeConsumer(consumer, userScopeService);
      const message = {MessageId: "id123", Body : "{\"operation\": \"asdf\", \"userEmail\": \"teste2\"}" }
      const messages = [message];      
      userScopeConsumer.handlerMessages(messages);       
     });

     it("should validate message is null", async () => {  
      userScopeConsumer = new UserScopeConsumer(consumer, userScopeService);
      const message = {MessageId: "id123", Body : "{\"operation\": \"asdf\", \"userEmail\": \"teste2\"}" }
      const messages = [message, null];      
      userScopeConsumer.handlerMessages(messages);       
     });

     it("should validate message.Body is null", async () => {  
      userScopeConsumer = new UserScopeConsumer(consumer, userScopeService);
      const message = {MessageId: "id123" }
      const messages = [message];      
      userScopeConsumer.handlerMessages(messages);       
     });


    it("should create an consumer for userscope with error", async () => {
      try {
      userScopeConsumer = new UserScopeConsumer(null, null);
      } catch (error) {}      
    });


    

  });
    


});

