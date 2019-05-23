"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const util_1 = require("./util");
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
            rateLimit = typeof spread == "boolean" ? util_1.Util.toFixed((limit / interval) * bucket, 2) : spread;
        }
        return rateLimit;
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], WindowCalculator.prototype, "moduleOptions", void 0);
WindowCalculator = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], WindowCalculator);
exports.WindowCalculator = WindowCalculator;
//# sourceMappingURL=windowCalculator.js.map