import { configure } from 'log4js';
import * as os from "os";


const hostname: string = os.hostname();
// appenders
const log4j = configure({
  appenders: {
    console: {
      type: 'stdout', layout: {
        type: 'pattern',
        pattern: '%d %p - %f{1} - %m'
      }
    },
    accesslog: {
      type: 'dateFile',
      filename: `./logs/${hostname}-accesslog.log`,
      layout: { type: 'basic' },
      compress: true,
      daysToKeep: 5,
      keepFileExt: true
    },
    scopes: {
      type: 'dateFile',
      filename: `./logs/${hostname}-scopes.log`,
      layout: {
        type: 'pattern',
        pattern: '%d %p - %f{1} - %m'
      },
      replaceConsole: true,
      compress: true,
      daysToKeep: 5,
      keepFileExt: true
    },

    consumer: {
      type: 'dateFile',
      filename: `./logs/${hostname}-scopes.log`,
      layout: {
        type: 'pattern',
        pattern: '%d %p - %f{1} - %m'
      },
      replaceConsole: true,
      compress: true,
      daysToKeep: 5,
      keepFileExt: true
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    accesslog: { appenders: ['accesslog', 'console'], level: 'info' },
    scopes: { appenders: ['console', 'scopes'], level: 'info', enableCallStack: true },
    consumer: { appenders: ['console', 'consumer'], level: 'debug', enableCallStack: true }
  }
});


export const defaultLogger = log4j.getLogger('default');

export const accesslogLogger = log4j.getLogger('accesslog');

export const scopeLogger = log4j.getLogger('scopes');

export const consumerLogger = log4j.getLogger('consumer');

export const log4js = log4j;