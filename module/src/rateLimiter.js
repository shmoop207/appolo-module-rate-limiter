"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
let RateLimiter = class RateLimiter {
    get frequency() {
        return {
            reserve: (key, limits) => this._run({ key, limits, check: false, limit: false }),
            check: (key, limits) => this._run({ key, limits, check: true, limit: false })
        };
    }
    get limit() {
        return {
            reserve: (key, limits) => this._run({ key, limits, check: false, limit: true }),
            check: (key, limits) => this._run({ key, limits, check: true, limit: true })
        };
    }
    async _run(opts) {
        let key = `${this.moduleOptions.keyPrefix}:${opts.limit ? "lmt" : "frq"}:{${opts.key}}`;
        let params = this._prepareSlidingWindowParams(opts);
        let results = await this.redisProvider.runScript("slidingWindow", [key], [JSON.stringify(params)], false);
        let dto = this._prepareResults(params, results);
        return dto;
    }
    _prepareSlidingWindowParams(opts) {
        let dto = [];
        for (let i = 0, len = opts.limits.length; i < len; i++) {
            let item = opts.limits[i];
            let { bucket, spread } = this._calcBucketIntervalAndSpread(item);
            dto.push({
                window: bucket,
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
                count: item[0],
                bucket: param.window,
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
    _calcBucketIntervalAndSpread(frequency) {
        let { interval, limit, spread, bucket } = frequency;
        bucket = this.windowCalculator.calcBucketInterval({ interval, limit, spread, bucket });
        spread = this.windowCalculator.calcRateLimit({ interval, limit, spread, bucket });
        return { bucket, spread };
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
tslib_1.__decorate([
    appolo_1.inject()
], RateLimiter.prototype, "windowCalculator", void 0);
RateLimiter = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], RateLimiter);
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map