import express, { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { hostname } from 'os';
import { version } from 'typescript';
import debugRaw from 'debug';
import Ajv from "ajv";

const debug = debugRaw('app');
const app = express();
const privateKey = readFileSync(process.env.PRIVATE_KEY!, 'utf-8');
const ajv = new Ajv({allErrors: true})
const schema = {
  type: "object",
  properties: {
    sub: {type: "string"},
    aud: {type: "string"},
    iss: { type: "string" }
  },
  required: ["sub", "aud", "iss"],
  additionalProperties: true,
}
app.use(express.json());
const validate = ajv.compile(schema)
type HealthCheck = (version: string) => (req: Request, res: Response ) => void




const simpleHealthCheck: HealthCheck = (version) => {
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
  const payload = {
    iss: process.env.ISS,
    ...req.body,
  }
  const expiresIn = (req.query.expiresIn ?? '1h') as string;
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn
  };
  function test(data: { sub?: string; aud?: string; iss?: string; }) {
    const valid = validate(data)
    if (valid) {
       debug("Valid payload, have a token.");
       debug(payload);
    } else if (!valid) {
      debug("No token for you, invalid payload: " + ajv.errorsText(validate.errors));
      return;
    }
    const token = jwt.sign(payload, privateKey, options);
    res.json({ token });
  }
  test(payload);
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



