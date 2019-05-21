"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_1 = require("appolo");
const Q = require("bluebird");
const index_1 = require("../index");
const chai = require("chai");
const sinonChai = require("sinon-chai");
let should = require('chai').should();
chai.use(sinonChai);
describe("Rate Limit", function () {
    let app, handler;
    beforeEach(async () => {
        app = appolo_1.createApp({ root: __dirname, environment: "production", port: 8181 });
        await app.module(new index_1.RateLimiterModule({ connection: process.env.REDIS }));
        await app.launch();
        handler = app.injector.get(index_1.RateLimiter);
        await handler.clear("test");
    });
    afterEach(async () => {
        await app.reset();
    });
    it("should frequency cap", async () => {
        let arr = Array(3).fill(1);
        let params = {
            key: "test",
            limits: [{
                    interval: 1000 * 60 * 5,
                    limit: 100,
                    spread: true
                }]
        };
        let results = await Q.map(arr, item => handler.frequencyCap(params), { concurrency: 100 });
        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(true);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].current.should.be.eq(2);
        results[1].results[0].remaining.should.be.eq(98);
        results[1].results[0].rate.should.be.eq(1);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].current.should.be.eq(2);
        await appolo_1.Util.delay(5100);
        let result2 = await handler.frequencyCap(params);
        result2.isValid.should.be.eq(true);
        result2.results[0].current.should.be.eq(3);
        result2.results[0].reset.should.be.gt((1000 * 60 * 5) - 5000);
    });
    it("should frequency check", async () => {
        let params = {
            key: "test",
            limits: [{
                    interval: 1000 * 60 * 5,
                    limit: 100,
                    spread: true
                }]
        };
        await handler.frequencyCap(params);
        let result = await handler.frequencyCheck(params);
        result.isValid.should.be.eq(true);
        result.results[0].current.should.be.eq(1);
    });
    it("should limit cap", async () => {
        let arr = Array(3).fill(1);
        let params = {
            key: "test",
            limits: [{
                    interval: 1000 * 60 * 5,
                    limit: 100,
                    spread: true
                }]
        };
        let results = await Q.map(arr, item => handler.limitCap(params), { concurrency: 100 });
        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(true);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].current.should.be.eq(2);
        results[1].results[0].remaining.should.be.eq(98);
        results[1].results[0].rate.should.be.eq(1);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].current.should.be.eq(2);
        await appolo_1.Util.delay(5100);
        let result2 = await handler.limitCap(params);
        result2.isValid.should.be.eq(true);
        result2.results[0].current.should.be.eq(3);
        result2.results[0].remaining.should.be.eq(97);
        result2.results[0].reset.should.be.lte((1000 * 60 * 5) - 5000);
    });
    it("should multi frequency cap", async () => {
        let arr = Array(3).fill(1);
        let params = {
            key: "test",
            limits: [{
                    interval: 1000 * 60 * 5,
                    limit: 100,
                    spread: true
                }, {
                    interval: 1000 * 60,
                    limit: 60,
                    spread: true
                }]
        };
        let results = await Q.map(arr, item => handler.frequencyCap(params), { concurrency: 100 });
        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(false);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].isValid.should.be.eq(true);
        results[1].results[1].isValid.should.be.eq(false);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].current.should.be.eq(2);
        results[1].results[1].current.should.be.eq(1);
        results[1].results[0].remaining.should.be.eq(98);
        results[1].results[0].rate.should.be.eq(1);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].current.should.be.eq(2);
        await appolo_1.Util.delay(1500);
        let result2 = await handler.frequencyCap(params);
        result2.isValid.should.be.eq(false);
        result2.results.length.should.be.eq(1);
        await appolo_1.Util.delay(3500);
        result2 = await handler.frequencyCap(params);
        result2.results[0].current.should.be.eq(3);
        result2.results[1].current.should.be.eq(2);
        result2.results[0].remaining.should.be.eq(97);
    });
    it("should  frequency cap no spread", async () => {
        let arr = Array(5).fill(1);
        let params = {
            key: "test",
            limits: [{
                    interval: 1000 * 60 * 5,
                    limit: 100
                }]
        };
        let results = await Q.map(arr, item => handler.frequencyCap(params), { concurrency: 100 });
        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(true);
        results[4].isValid.should.be.eq(true);
        results[4].results[0].current.should.be.eq(5);
        results[4].results[0].remaining.should.be.eq(95);
    });
});
//# sourceMappingURL=spec.js.map