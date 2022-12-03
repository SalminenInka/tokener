"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const os_1 = require("os");
const typescript_1 = require("typescript");
const debug = require('debug')('app');
const app = (0, express_1.default)();
const fileName = './private-key.pem';
const contents = (0, fs_1.readFileSync)(fileName, 'utf-8');
app.use(express_1.default.json());
const simpleHealthCheck = (version) => {
    return (req, res) => {
        const { userCPUTime, systemCPUTime } = process.resourceUsage();
        const { rss, heapTotal, heapUsed, external, } = process.memoryUsage();
        res.json({
            status: 'OK',
            version,
            hostname: (0, os_1.hostname)(),
            uptime: process.uptime(),
            memory: {
                rss, heapTotal, heapUsed, external,
            },
            userCPUTime,
            systemCPUTime,
        });
    };
};
app.post('/tokens', (req, res) => {
    const token = jsonwebtoken_1.default.sign(req.body, contents, { algorithm: 'RS256', expiresIn: '1h', issuer: process.env.ISS });
    res.json(token);
    console.log(req.body);
});
app.get('/status', simpleHealthCheck(typescript_1.version));
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
//# sourceMappingURL=app.js.map