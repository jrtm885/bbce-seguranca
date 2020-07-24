import AWS, { SQS } from "aws-sdk";
import { ConsumerParent } from "./ConsumerParent";
import { consumerLogger } from '../utils/LoggerUtil'
import { Consumer } from "sqs-consumer"
import { Agent } from "https";
import { IllegalArgumentMessageQueueException } from "../errors/SecurityErrors";
import { isNullOrWhitespace } from "../utils/Util";
import { UserScope } from "../entities/UserScope";
import { UserScopeService } from "../services/UserScopeService";
import { OPERATIONS } from "../SecurityConstants";

export class UserScopeConsumer extends ConsumerParent {

  private userScopeService: UserScopeService;

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
  public constructor(consumer: Consumer, userScopeService: UserScopeService) {
    super(process.env.ENVIRONMENT, process.env.REGION, process.env.USER_SCOPE_SQS_QUEUE);
    this.configureAndStartConsumer(consumer);
    this.userScopeService = userScopeService;
  }


  public configureAndStartConsumer(consumer: Consumer):void {
    consumerLogger.debug("initialize configureAndStartConsumer");
    if (consumer == null) {
      consumer = Consumer.create({
        queueUrl: this.queueUrl, pollingWaitTimeMs: 5000, batchSize: 10,
        handleMessageBatch: async (message) => { await this.handlerMessages(message); },
        sqs: this.sqs
      });
    }

    consumer.start();
    consumerLogger.debug("finalize configureAndStartConsumer");
  }

  public async handlerMessages(messages: SQS.Message[]):Promise<void> {
    consumerLogger.debug("Initialize all messages received");
    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      await this.handlerMessage(message);

    }
    consumerLogger.debug("Finalize all messages received");
  }


  private async handlerMessage(message: SQS.Message) {
    try {
      const userScope = this.convertAndValidateMessageFields(message);
      await this.callService(userScope);
    }
    catch (error) {
      consumerLogger.error(`occurred an exception when process the message. Exception: ${(error as Error).message}. Message: ${message.Body}`);
    }
  }

  private async callService(userScope: UserScope) {
    if (userScope.operation == OPERATIONS.PUT) {
      await this.userScopeService.updateInsert(userScope);
    }
    else if (userScope.operation == OPERATIONS.DELETE) {
      await this.userScopeService.delete(userScope);
    }
  }

  public convertAndValidateMessageFields(message: SQS.Message): UserScope {
    this.validateMessageNull(message);

    const userScope = JSON.parse(message.Body) as UserScope;
    this.validateOperations(userScope, message);
    return userScope;

  }

  private validateOperations(userScope: UserScope, message: SQS.Message) {
    if (isNullOrWhitespace(userScope.operation)) {
      throw new IllegalArgumentMessageQueueException(`operation field is null or empty.`);
    }
    if (userScope.operation != OPERATIONS.DELETE
      && userScope.operation != OPERATIONS.PUT) {
      throw new IllegalArgumentMessageQueueException(`operation field has an unexpected value[${userScope.operation}]. MessageId: ${message.MessageId}`);
    }
  }

  private validateMessageNull(message: SQS.Message) {
    if (message == null) {
      throw new IllegalArgumentMessageQueueException(`message received is null.`);
    }

    if (isNullOrWhitespace(message.Body)) {
      throw new IllegalArgumentMessageQueueException(`message.Body is null or empty.MessageId: ${message.MessageId}`);
    }
  }
}