interface IResponseObject {
  userAgent: string;
  url: string;
  remoteIp: string;
  path: string;
  method: string;
  statusCode: number;
  userId: number;
  error?: {
    message: string;
  };
}

export const loggerConfig = {
  pinoHttp: {
    level: 'info',
    customAttributeKeys: {
      req: 'http.request',
      res: 'http.response',
      responseTime: 'event.duration',
    },
    messageKey: 'message',
    timestamp: () => `,"@timestamp":"${new Date().toISOString()}"`,
    serializers: {
      ['http.response']: (object) => {
        const req = object[Object.getOwnPropertySymbols(object)[0]].req;
        const res: IResponseObject = {
          userAgent: req.headers['user-agent'],
          url: req.url,
          remoteIp:
            req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          path: req.route.path,
          method: req.method,
          statusCode: object.statusCode,
          userId: req?.user?.id,
        };

        if (req.res.isError) {
          res.error = {
            message: req.res.errorMessage,
          };
        }

        return res;
      },
      ['http.request']: () => {
        /** */
      },
    },
    formatters: {
      bindings(bindings: Record<string, unknown>) {
        const { pid, hostname, name, ...ecsBindings } = bindings;
        delete ecsBindings.ecs;

        if (pid !== undefined) {
          ecsBindings.pid = pid;
        }

        if (hostname !== undefined) {
          ecsBindings.hostname = hostname;
        }

        if (name !== undefined) {
          ecsBindings.log = { logger: name };
        }

        return ecsBindings;
      },
      level: (label: string) => ({ ['log.level']: label }),
      log: (ecsObject: {
        ['http.response']?: {
          isError: boolean;
        };
      }) => {
        if (ecsObject['http.response']?.isError) {
          ecsObject['log.level'] = 'error';
        }

        return ecsObject;
      },
    },
  },
};
