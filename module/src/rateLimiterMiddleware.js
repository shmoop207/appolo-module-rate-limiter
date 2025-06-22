"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterMiddleware = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const route_1 = require("@appolo/route");
let RateLimiterMiddleware = class RateLimiterMiddleware extends route_1.StaticMiddleware {
    async run(context, req, res, next) {
        const { keyGenerator, config } = context;
        const key = keyGenerator(req);
        const result = await this.rateLimiter.reserve({
            key,
            roles: [config]
        });
        if (!result.isValid) {
            return next(new route_1.HttpError(429, "Too many requests"));
        }
        next();
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], RateLimiterMiddleware.prototype, "rateLimiter", void 0);
tslib_1.__decorate([
    tslib_1.__param(0, (0, route_1.context)()),
    tslib_1.__param(1, (0, route_1.req)()),
    tslib_1.__param(2, (0, route_1.res)()),
    tslib_1.__param(3, (0, route_1.next)())
], RateLimiterMiddleware.prototype, "run", null);
RateLimiterMiddleware = tslib_1.__decorate([
    (0, inject_1.define)()
], RateLimiterMiddleware);
exports.RateLimiterMiddleware = RateLimiterMiddleware;
//# sourceMappingURL=rateLimiterMiddleware.js.map