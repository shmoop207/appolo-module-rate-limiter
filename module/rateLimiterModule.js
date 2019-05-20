"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const rateLimiter_1 = require("./src/rateLimiter");
let RateLimiterModule = class RateLimiterModule extends appolo_1.Module {
    constructor(options) {
        super(options);
        this.Defaults = {
            id: "rateLimiter",
            keyPrefix: "rl"
        };
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: rateLimiter_1.RateLimiter }];
    }
};
RateLimiterModule = tslib_1.__decorate([
    appolo_1.module()
], RateLimiterModule);
exports.RateLimiterModule = RateLimiterModule;
//# sourceMappingURL=rateLimiterModule.js.map