import http from 'http';
import { inject, injectable } from 'inversify';
import { IConfig } from '../domain/IConfig';
import ILogger from '../domain/ILogger';

@injectable()
export class HealthCheckServer {
  server: http.Server;

  constructor(
    @inject('IConfig') private config: IConfig,
    @inject('ILogger') private logger: ILogger,
  ) {
    this.server = http.createServer((req, res) => {
      if (req.url === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
  }

  async start() {
    return new Promise<void>((resolve, reject) => {
      this.server.listen(this.config.healthCheckPort, () => {
        this.logger.info(
          `Server running at port ${this.config.healthCheckPort}`,
        );
        return resolve();
      });

      this.server.once('error', reject);
    });
  }

  async stop() {
    return new Promise<void>((resolve, reject) => {
      this.server.close(() => {
        this.logger.info('Server stopped');
        return resolve();
      });

      this.server.once('error', reject);
    });
  }
}
