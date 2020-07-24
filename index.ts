

import { defaultLogger} from './src/utils/LoggerUtil';

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { accesslogLogger, log4js } from './src/utils/LoggerUtil';
import swaggerUi, { JsonObject } from "swagger-ui-express";
import YAML from "yamljs";
import bodyParser from "body-parser";
import { SWAGGER_FILE_PATH, SWAGGER_ROUTES_HANDLER_PATH } from "./src/SecurityConstants";
import { BODY_PARSER_LIMIT } from "./src/SecurityConstants";
import monitor from "express-status-monitor";






class Initializer {

    public configure() : void {

        const app = express();             
        
        this.configureCors(app);

        this.configureBodyParser(app);

        this.configureLog(app);

        this.configureSwagger(app);

        this.configureSwaggerRoutes(app);

        this.configureUse(app);

        this.configureHealthCheck(app);

        app.listen(8000);
        
    }

    public configureHealthCheck(app : express.Application) {
      app.use(monitor());   
    }    

    public configureBodyParser(app : express.Application) : void {
        app.use(bodyParser.json({ limit: BODY_PARSER_LIMIT }));
    }

    public configureLog(app : express.Application) : void {
        app.use(log4js.connectLogger(accesslogLogger, { level: 'info' }));
    }

    public configureCors(app : express.Application) : void {
        app.use(cors({
            exposedHeaders: ["forbbiden-reason"],
        }));
    }

    public configureSwagger(app: express.Application) : void {
        //configuração para exibição do swagger.
        const swaggerDocument = YAML.load(SWAGGER_FILE_PATH) as JsonObject;
        app.use(
            "/bbce/api-docs",
            swaggerUi.serve,
            swaggerUi.setup(swaggerDocument)
        );
    }

    public configureSwaggerRoutes(app: express.Application) : void {
        const swaggerRoutes = require("swagger-routes");
      swaggerRoutes(app, {
        api: SWAGGER_FILE_PATH,
        handlers: {
          path: SWAGGER_ROUTES_HANDLER_PATH,
          generate: false,
          group: false
        }
      });
    }

    public configureUse(app : express.Application) : void {
        app.use(
            (
              error: Error,
              req: Request,
              res: Response,
              next: NextFunction
            ): void => {
              if (error && (error as any).statusCode) {
                res
                  .status((error as any).statusCode)
                  .json({ error: error.message });
              } else if (error) {
                res.status(500).json({ error: error.message });
              } else {
                next(error);
              }
            }
          );
    }
}

try {
  (async () => {
    try {
      require('./dependencies');
      const initializer = new Initializer();
      initializer.configure();      
      defaultLogger.info('MS-Security listen');
    } catch (error) {
      defaultLogger.error(error);
      throw error;
    }
  })();
} catch (error) {
  defaultLogger.error(error);
  process.exit(-1);
}
