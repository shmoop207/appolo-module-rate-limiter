"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const util_1 = require("./util");
let RateLimiter = class RateLimiter {
    async frequencyCap(limits) {
        return this._run({ limits, check: false, limit: false });
    }
    async frequencyCheck(limits) {
        return this._run({ limits, check: true, limit: false });
    }
    async limitCap(limits) {
        return this._run({ limits, check: false, limit: true });
    }
    async limitCheck(limits) {
        return this._run({ limits, check: true, limit: true });
    }
    async _run(opts) {
        let key = `${this.moduleOptions.keyPrefix}:${opts.limit ? "lmt" : "frq"}:{${opts.limits.key}}`;
        let params = this._prepareSlidingWindowParams(opts);
        let results = await this.redisProvider.runScript("slidingWindow", [key], [JSON.stringify(params)], false);
        let dto = this._prepareResults(params, results);
        return dto;
    }
    _prepareSlidingWindowParams(opts) {
        let dto = [];
        for (let i = 0, len = opts.limits.limits.length; i < len; i++) {
            let item = opts.limits.limits[i];
            let [bucketSize, spread] = this._calcBacketSizeAndSpread(item);
            dto.push({
                window: bucketSize,
                interval: item.interval,
                limit: item.limit,
                reserve: item.reserve || 1,
                rateLimit: spread.toString(),
                check: opts.check,
                maxWindow: opts.limit ? (item.start || Date.now() + item.interval) : 0
            });
        }
        return dto;
    }
    _prepareResults(params, results) {
        let isValid = true;
        let dto = [];
        for (let i = 0, len = results.length; i < len; i++) {
            let item = results[i], param = params[i];
            dto.push({
                current: item[0],
                remaining: param.limit - (item[0]),
                limit: param.limit,
                rateLimit: parseFloat(param.rateLimit),
                rate: parseFloat(item[1]),
                isValid: !!item[2],
                reset: item[3],
                retry: item[4]
            });
            if (!item[2]) {
                isValid = false;
            }
        }
        return {
            results: dto,
            isValid
        };
    }
    _calcBacketSizeAndSpread(limit) {
        let rateLimit = 0;
        let bucketSize = Math.floor(limit.interval / 60);
        if (limit.spread) {
            bucketSize = Math.max(bucketSize, Math.floor(limit.interval / limit.limit));
            rateLimit = typeof limit.spread == "boolean" ? util_1.Util.toFixed((limit.limit / limit.interval) * bucketSize, 2) : limit.spread;
        }
        return [bucketSize, rateLimit];
    }
    async clear(key) {
        await this.redisProvider.delPattern(`${this.moduleOptions.keyPrefix}*{${key}}*`);
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], RateLimiter.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], RateLimiter.prototype, "redisProvider", void 0);
RateLimiter = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], RateLimiter);
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map