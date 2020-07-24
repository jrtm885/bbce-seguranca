import { Request, Response } from "express";
import { ApiScopeConsumer } from "../src/consumers/ApiScopeConsumer";
import dynamoDb from 'aws-sdk/clients/dynamodb';
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";
import { IllegalArgumentException, ResourceNotFoundException, InvalidTokenException, IllegalArgumentMessageQueueException } from "../src/errors/SecurityErrors";
import { AccessService } from "../src/services/AccessService";
import { Consumer } from "sqs-consumer";
import { ApiScopeService } from "../src/services/ApiScopeService";
import { SQS } from "aws-sdk";


describe('UserScopeConsumer', () => {



  const consumer = {} as Consumer;
  const apiScopeService: ApiScopeService = new ApiScopeService();
  let apiScopeConsumer: ApiScopeConsumer = null;


  beforeEach(() => {
    jest.resetAllMocks();
    consumer.start = jest.fn().mockReturnThis();
  });

  // METHOD getFrontScopesByUser
  describe("Call normally put and delete operations.", () => {

    it("should read a message with put operation", async () => {
      apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
      const message = { MessageId: "id123", Body: "{\"operation\": \"put\", \"api\": \"teste2\", \"verb\": \"GET\", \"scopes\": [3,2,1]}" }
      const messages = [message];
      apiScopeService.updateInsert = jest.fn().mockReturnThis();
      await apiScopeConsumer.handlerMessages(messages);
    });

    it("should read a message with delete operation", async () => {
      apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
      const message = { MessageId: "id123", Body: "{\"operation\": \"delete\", \"api\": \"teste2\", \"verb\": \"GET\"}" }
      const messages = [message];
      apiScopeService.delete = jest.fn().mockReturnThis();
      await apiScopeConsumer.handlerMessages(messages);
    });

    it("should read a message with delete operation with exception", async () => {
      apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
      const message = { MessageId: "id123", Body: "{\"operation\": \"eee\", \"verb\": \"GET\"}" }
      const messages = [message];
      apiScopeService.delete = jest.fn().mockReturnThis();
      await apiScopeConsumer.handlerMessages(messages);
    });

  });

  describe("convertAndValidateMessageFields", () => {


    it("should validate operation is undefined.", async () => {
      let isExpectedErr = false;
      try {
        apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
        const message = { MessageId: "id123", Body: "{\"api\": \"teste2\", \"verb\": \"GET\", \"scopes\": [3,2,1]}" }
        apiScopeConsumer.convertAndValidateMessageFields(message);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
        expect(error.message).toBe("operation field is null or empty.");
      }
      expect(isExpectedErr).toEqual(true);
    });

    it("should validate operation has an unexpected value.", async () => {
      let isExpectedErr = false;
      try {
        apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
        const message = { MessageId: "id123", Body: "{\"operation\": \"teste\", \"api\": \"teste2\", \"verb\": \"GET\", \"scopes\": [3,2,1]}" }
        apiScopeConsumer.convertAndValidateMessageFields(message);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
        expect(error.message).toBe("operation field has an unexpected value[teste]. MessageId: id123");
      }
      expect(isExpectedErr).toEqual(true);
    });

  });

  describe("validateMessageNull", () => {

    it("should process normally.", async () => {

      apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
      const message = { MessageId: "id123", Body: "{\"operation\": \"teste\", \"api\": \"teste2\", \"verb\": \"GET\", \"scopes\": [3,2,1]}" }
      apiScopeConsumer.validateMessageNull(message);

    });

    it("should validate message is null.", async () => {
      let isExpectedErr = false;
      try {
        apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
        apiScopeConsumer.validateMessageNull(null);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
        expect(error.message).toBe("message received is null.");
      }
      expect(isExpectedErr).toEqual(true);
    });

    it("should validate message.Body is null.", async () => {
      let isExpectedErr = false;
      try {
        apiScopeConsumer = new ApiScopeConsumer(consumer, apiScopeService);
        const message = { MessageId: "id123" }
        apiScopeConsumer.validateMessageNull(message);
      } catch (error) {
        isExpectedErr = error instanceof IllegalArgumentMessageQueueException;
        expect(error.message).toBe("message.Body is null or empty.MessageId: id123");
      }
      expect(isExpectedErr).toEqual(true);
    });

  });


});

