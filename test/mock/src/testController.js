"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const tslib_1 = require("tslib");
const route_1 = require("@appolo/route");
const rateLimiterMiddleware_1 = require("../../../module/src/rateLimiterMiddleware");
let TestController = class TestController extends route_1.Controller {
    async helloWorld() {
        return this.send(200, "hello world");
    }
};
tslib_1.__decorate([
    route_1.middleware(rateLimiterMiddleware_1.RateLimiterMiddleware.for({
        config: {
            interval: 3 * 60 * 1000,
            limit: 5,
        },
        keyGenerator: (req) => "hardcoded_test_key"
    })),
    route_1.get('/hello_world')
], TestController.prototype, "helloWorld", null);
TestController = tslib_1.__decorate([
    route_1.controller()
], TestController);
exports.TestController = TestController;
//# sourceMappingURL=testController.js.map