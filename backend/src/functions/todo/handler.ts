import { formatJSONResponse } from "../../libs/api-gateway";
import { middyfy } from "../../libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpStatusCode } from "axios";
import { getUserId } from "../../helpers/auth/auth.helper";
import { createLogger } from "../../helpers/logging/logging.helper";
import Todo from "../../models/todo.model";
import todoService from "../../services";
import { TodoCreate } from "../../view-models/todo-create.view-model";
import { TodoUpdate } from "../../view-models/todo-update.view-model";
import { v4 } from "uuid";

export const getTodos = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger("Logging: Get all Todos");

    const userId = getUserId(event); 

    logger.info("Logging: Getting all Todo");

    const todos: Todo[] = await todoService.getAll(userId);

    return formatJSONResponse(HttpStatusCode.Ok, {
      items: todos,
    });
  }
);

export const getTodo = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger("Logging: Get Todo by ID");

    const userId = getUserId(event); 
    const todoId = event.pathParameters.todoId;
    logger.info("Logging: Getting Todo by ID");

    const todo: Todo = await todoService.getByID(todoId, userId);

    return formatJSONResponse(HttpStatusCode.Ok, {
      item: todo,
    });
  }
);

export const createTodo = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger("Logging: Create new Todo");
    try {
      const userId = getUserId(event);
      const todoCreate: TodoCreate = event.body as any;

      logger.info("Logging: Creating a new Todo", todoCreate);

      const toDoItem = await todoService.create(todoCreate, userId);

      return formatJSONResponse(HttpStatusCode.Created, {
        item: toDoItem,
      });
    } catch (e) {
      logger.error(`Logging: Create new Todo fail: ${e.message}`);

      return formatJSONResponse(HttpStatusCode.InternalServerError, {
        message: e.message,
      });
    }
  }
);

export const updateTodo = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger("Logging: Update Todo");
    try {
      const userId = getUserId(event);

      const todoId = event.pathParameters.todoId;

      const updatedTodo: TodoUpdate = event.body as any;

      logger.info("Logging: Updating Todo ", updatedTodo);

      const toDoItem = await todoService.update(todoId, userId, updatedTodo);

      return formatJSONResponse(HttpStatusCode.Ok, {
        item: toDoItem,
      });
    } catch (e) {
      logger.error(`Logging: Update Todo fail: ${e.message}`);

      return formatJSONResponse(HttpStatusCode.InternalServerError, {
        message: e.message,
      });
    }
  }
);

export const deleteTodo = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger("Logging: Delete Todo by Id");
    try {
      const userId = getUserId(event);

      const todoId = event.pathParameters.todoId;
      logger.info("Logging: Deleting a Todo by Id ", todoId);

      const deleteData = await todoService.delete(todoId, userId);

      return formatJSONResponse(HttpStatusCode.Ok, {
        result: deleteData,
      });
    } catch (e) {
      logger.error(`Logging: Delete Todo fail: ${e.message}`);

      return formatJSONResponse(HttpStatusCode.InternalServerError, {
        message: e.message,
      });
    }
  }
);

export const generateUploadUrl = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger("Logging: Generate upload URL");
    const userId = getUserId(event);

    const todoId = event.pathParameters.todoId;
    const attachmentId = v4();

    const uploadUrl = await todoService.generateUploadUrl(attachmentId);
    logger.info("Logging: Generating upload URL ", uploadUrl);

    try {
      logger.info(
        `Logging: Update Todo Attachment URL ${uploadUrl} with attachment id = ${attachmentId} for todo with id = ${todoId}`
      );
      await todoService.updateAttachmentUrl(userId, todoId, attachmentId);

      return {
        statusCode: 202,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          uploadUrl: uploadUrl,
        }),
      };
    } catch (e) {
      logger.error(`Logging: Update Todo's Attachment URL fail: ${e.message}`);
    }
  }
);
