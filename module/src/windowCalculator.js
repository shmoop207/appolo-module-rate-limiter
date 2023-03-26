"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowCalculator = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const utils_1 = require("@appolo/utils");
let WindowCalculator = class WindowCalculator {
    calcBucketInterval({ interval, limit, bucket, spread }) {
        bucket = bucket || Math.floor(interval / this.moduleOptions.maxBuckets);
        bucket = Math.max(bucket, this.moduleOptions.minBucketInterval);
        if (spread) {
            bucket = Math.max(bucket, Math.floor(interval / limit));
        }
        return bucket;
    }
    calcRateLimit({ interval, limit, bucket, spread }) {
        let rateLimit = 0;
        if (spread) {
            rateLimit = typeof spread == "boolean" ? utils_1.Util.numbers.toFixed((limit / interval) * bucket, 2) : spread;
        }
        return rateLimit;
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], WindowCalculator.prototype, "moduleOptions", void 0);
WindowCalculator = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], WindowCalculator);
exports.WindowCalculator = WindowCalculator;
//# sourceMappingURL=windowCalculator.js.map