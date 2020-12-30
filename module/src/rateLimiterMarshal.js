"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterMarshal = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const rateLimitType_1 = require("./common/rateLimitType");
let RateLimiterMarshal = class RateLimiterMarshal {
    prepareParams(roles, check) {
        let dto = [];
        for (let i = 0, len = roles.roles.length; i < len; i++) {
            let role = roles.roles[i];
            let { interval, limit, spread, bucket } = role;
            bucket = this.windowCalculator.calcBucketInterval({ interval, limit, spread, bucket });
            spread = this.windowCalculator.calcRateLimit({ interval, limit, spread, bucket });
            let now = Date.now();
            let dtoParams = {
                window: bucket,
                interval: role.interval,
                limit: role.limit,
                reserve: role.reserve || 1,
                rateLimit: spread.toString(),
                check: check,
                slim: !!roles.slim,
                force: !!role.forceUpdate,
                maxWindow: roles.type == rateLimitType_1.RateLimitType.FixedWindow ? ((role.start || now) + role.interval) : 0
            };
            if (dtoParams.maxWindow && dtoParams.maxWindow < now) {
                throw new Error("start time + interval is lower then current date");
            }
            dto.push(dtoParams);
        }
        return dto;
    }
    prepareResults(params, results) {
        let isValid = true;
        let dto = [];
        for (let i = 0, len = results.length; i < len; i++) {
            let item = results[i], param = params[i];
            if (!param.slim) {
                dto.push({
                    count: item[1],
                    bucket: param.window,
                    remaining: param.limit - (item[1]),
                    limit: param.limit,
                    rateLimit: parseFloat(param.rateLimit),
                    rate: parseFloat(item[2]),
                    isValid: !!item[0],
                    reset: item[3],
                    retry: item[4]
                });
            }
            if (!item[0]) {
                isValid = false;
            }
        }
        return {
            results: dto,
            isValid
        };
    }
};
tslib_1.__decorate([
    inject_1.inject()
], RateLimiterMarshal.prototype, "windowCalculator", void 0);
RateLimiterMarshal = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], RateLimiterMarshal);
exports.RateLimiterMarshal = RateLimiterMarshal;
//# sourceMappingURL=rateLimiterMarshal.js.map