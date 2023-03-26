"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterMiddleware = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const route_1 = require("@appolo/route");
let RateLimiterMiddleware = class RateLimiterMiddleware extends route_1.Middleware {
    async run(context, req, res, next) {
        const { keyGenerator, config } = context;
        const key = keyGenerator(req);
        const result = await this.rateLimiter.reserve({
            key,
            roles: [config]
        });
        if (!result.isValid) {
            return this.sendError("Too many requests", 429);
        }
        next();
    }
};
tslib_1.__decorate([
    inject_1.inject()
], RateLimiterMiddleware.prototype, "rateLimiter", void 0);
tslib_1.__decorate([
    tslib_1.__param(0, route_1.context()), tslib_1.__param(1, route_1.req()), tslib_1.__param(2, route_1.res()), tslib_1.__param(3, route_1.next())
], RateLimiterMiddleware.prototype, "run", null);
RateLimiterMiddleware = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], RateLimiterMiddleware);
exports.RateLimiterMiddleware = RateLimiterMiddleware;
//# sourceMappingURL=rateLimiterMiddleware.js.map