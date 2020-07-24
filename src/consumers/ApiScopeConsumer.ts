import AWS, { SQS } from "aws-sdk";
import { ConsumerParent } from "./ConsumerParent";
import { consumerLogger } from '../utils/LoggerUtil'
import { Consumer } from "sqs-consumer"
import { Agent } from "https";
import { IllegalArgumentMessageQueueException } from "../errors/SecurityErrors";
import { isNullOrWhitespace } from "../utils/Util";
import { ApiScope } from "../entities/ApiScope";
import { ApiScopeService } from "../services/ApiScopeService";
import { OPERATIONS } from "../SecurityConstants";

export class ApiScopeConsumer extends ConsumerParent {

  private apiScopeService: ApiScopeService;

  private sqs = new AWS.SQS({
    region: this.region,
    httpOptions: {
      agent: new Agent({
        keepAlive: true
      })
    }
  });

  /**
   * Construtor recebe consumer para viabilizar os testes unitários.
   * Caso venha null, é criado um consumer apontando para uma fila real. 
   * Os testes unitários passam um consumer mockado para a realização dos testes unitários.
   * @param consumer 
   */
  public constructor(consumer: Consumer, apiScopeService: ApiScopeService) {
    super(process.env.ENVIRONMENT, process.env.REGION, process.env.API_SCOPE_SQS_QUEUE);
    this.configureAndStartConsumer(consumer);
    this.apiScopeService = apiScopeService;
  }


  public configureAndStartConsumer(consumer: Consumer):void {
    consumerLogger.debug("initialize apiScopeConsumer - configureAndStartConsumer");
    if (consumer == null) {
      consumer = Consumer.create({
        queueUrl: this.queueUrl, pollingWaitTimeMs: 5000, batchSize: 10,
        handleMessageBatch: async (message) => { await this.handlerMessages(message); },
        sqs: this.sqs
      });
    }

    consumer.start();
    consumerLogger.debug("finalize apiScopeConsumer - configureAndStartConsumer");
  }

  public async handlerMessages(messages: SQS.Message[]):Promise<void> {
    consumerLogger.debug("Initialize apiScopeConsumer all messages received");
    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      await this.handlerMessage(message);

    }
    consumerLogger.debug("Finalize apiScopeConsumer all messages received");
  }


  private async handlerMessage(message: SQS.Message) {
    try {
      const apiScope = this.convertAndValidateMessageFields(message);
      await this.callService(apiScope);
    }
    catch (error) {
      consumerLogger.error(`occurred an exception when process the message. Exception: ${(error as Error).message}. Message: ${message.Body}`);
    }
  }

  private async callService(apiScope: ApiScope):Promise<void> {
    if (apiScope.operation == OPERATIONS.PUT) {
      await this.apiScopeService.updateInsert(apiScope);
    }
    else if (apiScope.operation == OPERATIONS.DELETE) {
      await this.apiScopeService.delete(apiScope);
    }
  }

  public convertAndValidateMessageFields(message: SQS.Message): ApiScope {
    this.validateMessageNull(message);

    const apiScope = JSON.parse(message.Body) as ApiScope;
    this.validateOperations(apiScope, message);
    return apiScope;

  }

  private validateOperations(apiScope: ApiScope, message: SQS.Message) {
    if (isNullOrWhitespace(apiScope.operation)) {
      throw new IllegalArgumentMessageQueueException(`operation field is null or empty.`);
    }
    if (apiScope.operation != OPERATIONS.DELETE
      && apiScope.operation != OPERATIONS.PUT) {
      throw new IllegalArgumentMessageQueueException(`operation field has an unexpected value[${apiScope.operation}]. MessageId: ${message.MessageId}`);
    }
  }

  public validateMessageNull(message: SQS.Message):void {
    if (message == null) {
      throw new IllegalArgumentMessageQueueException(`message received is null.`);
    }

    if (isNullOrWhitespace(message.Body)) {
      throw new IllegalArgumentMessageQueueException(`message.Body is null or empty.MessageId: ${message.MessageId}`);
    }
  }
}