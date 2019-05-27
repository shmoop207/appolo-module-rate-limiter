"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const redis_1 = require("@appolo/redis");
const rateLimitType_1 = require("./common/rateLimitType");
let RateLimiter = class RateLimiter {
    reserve({ key, roles, type = rateLimitType_1.RateLimitType.SlidingWindow }) {
        return this._run({ key, roles, type, check: false });
    }
    check({ key, roles, type = rateLimitType_1.RateLimitType.SlidingWindow }) {
        return this._run({ key, roles, type, check: true });
    }
    async _run({ key, roles, type, check }) {
        let redisKey = `${this.moduleOptions.keyPrefix}:${type == rateLimitType_1.RateLimitType.FixedWindow ? "lmt" : "frq"}:{${key}}`;
        let params = this.rateLimiterMarshal.prepareParams(roles, type, check);
        let results = await this.redisProvider.runScript("slidingWindow", [redisKey], [JSON.stringify(params)], false);
        let dto = this.rateLimiterMarshal.prepareResults(params, results);
        return dto;
    }
    async clear(key) {
        await this.redisProvider.delPattern(`${this.moduleOptions.keyPrefix}*{${key}}*`);
    }
    get redisProvider() {
        return this._redisProvider;
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], RateLimiter.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    appolo_1.inject(redis_1.RedisProvider)
], RateLimiter.prototype, "_redisProvider", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], RateLimiter.prototype, "rateLimiterMarshal", void 0);
RateLimiter = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], RateLimiter);
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map