import {App, createApp, Util} from 'appolo'
import * as Q from 'bluebird'
import {RateLimiter, RateLimiterModule} from "../index";
import chai = require('chai');
import    sinonChai = require("sinon-chai");


let should = require('chai').should();
chai.use(sinonChai);


describe("Rate Limit", function () {

    let app: App, handler: RateLimiter;

    beforeEach(async () => {

        app = createApp({root: __dirname, environment: "production", port: 8181});

        await app.module(new RateLimiterModule({connection: process.env.REDIS}));

        await app.launch();

        handler = app.injector.get<RateLimiter>(RateLimiter);

        await handler.clear("test");
    });

    afterEach(async () => {
        await app.reset();
    });

    it("should frequency cap", async () => {


        let arr = Array(3).fill(1);

        let key = "test";
        let params = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: true
        }];


        let results = await Q.map(arr, item => handler.frequency.reserve(key, params), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(true);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].count.should.be.eq(2);
        results[1].results[0].remaining.should.be.eq(98);
        results[1].results[0].rate.should.be.eq(1);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].count.should.be.eq(2);

        await Util.delay(5100);

        let result2 = await handler.frequency.reserve(key, params);

        result2.isValid.should.be.eq(true);
        result2.results[0].count.should.be.eq(3);
        result2.results[0].reset.should.be.gt((1000 * 60 * 5) - 5000);

    });

    it("should frequency check", async () => {

        let key = "test";
        let params = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: true
        }];


        await handler.frequency.reserve(key, params);

        let result = await handler.frequency.check(key, params);

        result.isValid.should.be.eq(true);
        result.results[0].count.should.be.eq(1);
    });

    it("should limit cap", async () => {


        let arr = Array(3).fill(1);
        let key = "test";
        let params = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: true
        }];

        let results = await Q.map(arr, item => handler.limit.reserve(key, params), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(true);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].count.should.be.eq(2);
        results[1].results[0].remaining.should.be.eq(98);
        results[1].results[0].rate.should.be.eq(1);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].count.should.be.eq(2);

        await Util.delay(5100);

        let result2 = await handler.limit.reserve(key, params);

        result2.isValid.should.be.eq(true);
        result2.results[0].count.should.be.eq(3);
        result2.results[0].remaining.should.be.eq(97);
        result2.results[0].reset.should.be.lte((1000 * 60 * 5) - 5000);
    });

    it("should multi frequency cap", async () => {

        let arr = Array(3).fill(1);
        let key = "test";
        let params = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: 1.67
        }, {
            interval: 1000 * 60,
            limit: 60,
            spread: 1
        }]

        let results = await Q.map(arr, item => handler.frequency.reserve(key, params), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(false);
        results[2].isValid.should.be.eq(false);

        results[1].results[0].isValid.should.be.eq(true);
        results[1].results[1].isValid.should.be.eq(false);

        results[2].isValid.should.be.eq(false);
        results[1].results[0].count.should.be.eq(2);
        results[1].results[1].count.should.be.eq(1);

        results[1].results[0].remaining.should.be.eq(98);
        results[1].results[0].rate.should.be.eq(1);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].count.should.be.eq(2);

        await Util.delay(1500);

        let result2 = await handler.frequency.reserve(key, params);

        result2.isValid.should.be.eq(false);
        result2.results.length.should.be.eq(1);

        await Util.delay(3500);

        result2 = await handler.frequency.reserve(key, params);

        result2.results[0].count.should.be.eq(3);

        result2.results[1].count.should.be.eq(2);
        result2.results[0].remaining.should.be.eq(97);
    });

    it("should  frequency cap no spread", async () => {

        let arr = Array(5).fill(1);

        let key = "test";
        let params = [{
            interval: 1000 * 60 * 5,
            limit: 100
        }];


        let results = await Q.map(arr, item => handler.frequency.reserve(key, params), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(true);
        results[4].isValid.should.be.eq(true);

        results[4].results[0].count.should.be.eq(5);

        results[4].results[0].remaining.should.be.eq(95);
    });


});