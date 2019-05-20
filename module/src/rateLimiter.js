"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const _ = require("lodash");
const Util_1 = require("./Util");
let RateLimiter = class RateLimiter {
    async reserve(limits) {
        let key = `${this.moduleOptions.keyPrefix}:{${limits.key}}`;
        let params = this._prepareSlidingWindowParams(limits);
        let results = await this.redisProvider.runScript("slidingWindow", [key], [JSON.stringify(params)], false);
        let dto = this._prepareResults(params, results);
        return dto;
    }
    async check(limits) {
    }
    _prepareResults(params, results) {
        let isValid = true;
        let dto = [];
        for (let i = 0, len = results.length; i < len; i++) {
            let item = results[i], param = params[i];
            dto.push({
                current: item[0],
                remaining: param.limit - item[0],
                limit: param.limit,
                rate: (param.interval * parseFloat(item[1])) / param.window,
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
    _prepareSlidingWindowParams(limits, check = false) {
        let dto = _.map(limits.limits, item => {
            let [bucketSize, spread] = this._calcBacketSizeAndSpread(item);
            return {
                window: bucketSize,
                interval: item.interval,
                limit: item.limit,
                reserve: item.reserve || 1,
                spread: spread.toString(),
                check: check
            };
        });
        return dto;
    }
    _calcBacketSizeAndSpread(limit) {
        let spread = 0;
        let bucketSize = Math.floor(limit.interval / 60);
        if (limit.spread) {
            bucketSize = Math.max(bucketSize, Math.floor(limit.interval / limit.limit));
            spread = limit.spread == "auto" ? Util_1.Util.toFixed((limit.limit / limit.interval) * bucketSize, 2) : limit.spread;
        }
        return [bucketSize, spread];
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