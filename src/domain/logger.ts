/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
import { get } from 'lodash';
import ILogger from './ILogger';

export function captureError(message?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    const errorMessage = message ?? propertyKey;

    descriptor.value = function (...args: unknown[]): void | Promise<void> {
      const logger = (get(this, 'logger') as undefined | ILogger) ?? console;

      try {
        const result = original.apply(this, args);

        if (typeof result === 'object' && typeof result.catch === 'function') {
          return result.catch((e: unknown) => logger.error(errorMessage, e));
        }

        return result;
      } catch (error) {
        logger.error(errorMessage, error);
      }

      return undefined;
    };

    return descriptor;
  };
}

export function logCall(message: string, logArguments = false) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const logger = (get(this, 'logger') as undefined | ILogger) ?? console;

      if (logArguments) {
        logger.debug(message, ...args);
      } else {
        logger.debug(message);
      }

      return original.apply(this, args);
    };

    return descriptor;
  };
}

export function logOutput(message: string, path?: string | string[]) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const logger = (get(this, 'logger') as undefined | ILogger) ?? console;

      const logResult = (res: unknown) => {
        if (path) {
          logger.debug(message, get(res, path));
        } else {
          logger.debug(message, res);
        }
      };

      const result = original.apply(this, args);

      if (typeof result === 'object' && typeof result.catch === 'function') {
        return result.then((res: unknown) => {
          logResult(res);

          return res;
        });
      }

      logResult(result);

      return result;
    };

    return descriptor;
  };
}
