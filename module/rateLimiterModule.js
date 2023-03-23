"use strict";
var RateLimiterModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterModule = void 0;
const tslib_1 = require("tslib");
const engine_1 = require("@appolo/engine");
const rateLimiter_1 = require("./src/rateLimiter");
const rateLimiterMiddleware_1 = require("./src/rateLimiterMiddleware");
let RateLimiterModule = RateLimiterModule_1 = class RateLimiterModule extends engine_1.Module {
    constructor() {
        super(...arguments);
        this.Defaults = {
            id: "rateLimiter",
            keyPrefix: "rl",
            maxBuckets: 600,
            minBucketInterval: 5000
        };
    }
    static for(options) {
        return { type: RateLimiterModule_1, options };
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: rateLimiter_1.RateLimiter },
            rateLimiterMiddleware_1.RateLimiterMiddleware
        ];
    }
};
RateLimiterModule = RateLimiterModule_1 = tslib_1.__decorate([
    engine_1.module()
], RateLimiterModule);
exports.RateLimiterModule = RateLimiterModule;
//# sourceMappingURL=rateLimiterModule.js.map