"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const redis_1 = require("@appolo/redis");
const rateLimitType_1 = require("./common/rateLimitType");
let RateLimiter = class RateLimiter {
    reserve(roles) {
        return this._run(roles, false);
    }
    check(roles) {
        return this._run(roles, true);
    }
    async _run(roles, check) {
        let redisKey = this._createKey(roles);
        let params = this.rateLimiterMarshal.prepareParams(roles, check);
        let results = await this.redisProvider.runScript("slidingWindow", [redisKey], [JSON.stringify(params)], false);
        let dto = this.rateLimiterMarshal.prepareResults(params, results);
        return dto;
    }
    _createKey(roles) {
        return `${this.moduleOptions.keyPrefix}:${roles.type == rateLimitType_1.RateLimitType.FixedWindow ? "lmt" : "frq"}:{${roles.key}}`;
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