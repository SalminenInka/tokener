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
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('app');
const app = (0, express_1.default)();
const privateKey = (0, fs_1.readFileSync)(process.env.PRIVATE_KEY, 'utf-8');
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
    const payload = {
        iss: process.env.ISS,
        ...req.body,
    };
    const expiresIn = (req.query.expiresIn ?? '1h');
    const options = {
        algorithm: 'RS256',
        expiresIn
    };
    const token = jsonwebtoken_1.default.sign(payload, privateKey, options);
    res.json({ token });
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