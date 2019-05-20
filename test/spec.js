"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_1 = require("appolo");
const index_1 = require("../index");
const chai = require("chai");
const sinonChai = require("sinon-chai");
let should = require('chai').should();
chai.use(sinonChai);
describe("PubSub Spec", function () {
    let app;
    beforeEach(async () => {
        app = appolo_1.createApp({ root: __dirname, environment: "production", port: 8181 });
        await app.module(new index_1.RateLimiterModule({ connection: process.env.REDIS }));
        await app.launch();
    });
    afterEach(async () => {
        await app.reset();
    });
    it("should cache sync", async () => {
        let handler = app.injector.get(index_1.RateLimiter);
        let result = await handler.reserve({
            key: "test",
            limits: [{
                    interval: 1000 * 60 * 5,
                    limit: 100,
                    spread: "auto"
                }]
        });
        console.log(result);
        // handler.handle();
        // handler.handle();
        // handler.handle();
        //
        // handler.test.should.be.eq(1);
        await appolo_1.Util.delay(1000);
    });
});
//# sourceMappingURL=spec.js.map