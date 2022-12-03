import express, { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import { hostname } from 'os';
import { version } from 'typescript';
const debug: NodeRequire = require('debug')('app');
const app = express();
const fileName = './private-key.pem';
const contents = readFileSync(fileName, 'utf-8');

app.use(express.json());

const simpleHealthCheck = (version: string) => {
  return (req: Request, res: Response) => {
    const { userCPUTime, systemCPUTime } = process.resourceUsage();
    const {
      rss, heapTotal, heapUsed, external,
    } = process.memoryUsage();
    res.json({
      status: 'OK',
      version,
      hostname: hostname(),
      uptime: process.uptime(),
      memory: {
        rss, heapTotal, heapUsed, external,
      },
      userCPUTime,
      systemCPUTime,
    });
  };
};


interface PostRequest<T = any> extends Request {
  params: {
    query: string;
  },
  body: T,
}

app.post('/tokens', (req: PostRequest, res: Response) => {
  const token = jwt.sign(req.body, contents, { algorithm: 'RS256', expiresIn: '1h', issuer: process.env.ISS });
  res.json(token);
  console.log(req.body);
})

app.get('/status', simpleHealthCheck(version));

// here is the code

const port = +(process.env.PORT || '8080');
const server = app.listen(port, () => {
  debug(`Running on ${port}`);
});

process.on('SIGTERM', () => {
  debug('SIGTERM signal received, closing the HTTP server');
  server.close(() => {
    debug('HTTP server closed');
  });
});


