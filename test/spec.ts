import {App, createApp} from '@appolo/core'
import {Promises} from '@appolo/utils'
import {RateLimiter, RateLimiterModule, RateLimitType} from "../index";
import chai = require('chai');
import sinonChai = require("sinon-chai");
import {it} from "mocha";
import chaiHttp = require('chai-http');

chai.use(chaiHttp);

let should = require('chai').should();
chai.use(sinonChai);


describe("Rate Limit Middleware", function () {
    let app: App;

    beforeEach(async () => {

        app = createApp({root: __dirname + "/mock", environment: "production", port: 8182});

        app.module.use(RateLimiterModule.for({connection: process.env.REDIS}));

        await app.launch();
    });

    afterEach(async () => {

        await app.reset();
    });


    it("Should test middleware", async () => {

        const arr = Array(6).fill(1);

        const results = await Promises.map(arr, async () => {
            console.log("sent");
            const res = await chai.request(app.route.handle).get('/hello_world');
            return res.status;
        });

        results[0].should.be.eq(200);
        results[1].should.be.eq(200);
        results[2].should.be.eq(200);
        results[3].should.be.eq(200);
        results[4].should.be.eq(200);
        results[5].should.be.eq(429);

    });



})

describe("Rate Limit", function () {

    let app: App, handler: RateLimiter;

    beforeEach(async () => {

        app = createApp({root: __dirname, environment: "production"});

        app.module.use(RateLimiterModule.for({connection: process.env.REDIS}));

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
        let roles = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: true
        }];


        let results = await Promises.map(arr, item => handler.reserve({key, roles}), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(false);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].count.should.be.eq(1);
        results[1].results[0].remaining.should.be.eq(99);
        results[1].results[0].rate.should.be.eq(2);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].count.should.be.eq(1);

        await Promises.delay(5300);

        let result2 = await handler.reserve({key, roles});

        result2.isValid.should.be.eq(true);
        result2.results[0].count.should.be.eq(2);
        result2.results[0].reset.should.be.gt((1000 * 60 * 5) - 5000);

    });

    it("should frequency check", async () => {

        let key = "test";
        let roles = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: true
        }];


        await handler.reserve({key, roles});

        await Promises.delay(5300);

        let result = await handler.check({key, roles});

        result.isValid.should.be.eq(true);
        result.results[0].count.should.be.eq(1);
    });

    it("should limit cap", async () => {


        let arr = Array(3).fill(1);
        let key = "test";
        let roles = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: true,
        }];

        let results = await Promises.map(arr, item => handler.reserve({
            key,
            roles,
            type: RateLimitType.FixedWindow
        }), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(false);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].count.should.be.eq(1);
        results[1].results[0].remaining.should.be.eq(99);
        results[1].results[0].rate.should.be.eq(2);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].count.should.be.eq(1);

        await Promises.delay(5100);

        let result2 = await handler.reserve({key, roles, type: RateLimitType.FixedWindow});

        result2.isValid.should.be.eq(true);
        result2.results[0].count.should.be.eq(2);
        result2.results[0].remaining.should.be.eq(98);
        result2.results[0].reset.should.be.lte((1000 * 60 * 5) - 5000);
    });


    it("should limit cap force update", async () => {


        let arr = Array(3).fill(1);
        let key = "test";
        let roles = [{
            interval: 1000 * 60 * 5,
            forceUpdate: true,
            limit: 100,
            spread: true,
        }];

        let results = await Promises.map(arr, item => handler.reserve({
            key,
            roles,
            type: RateLimitType.FixedWindow
        }), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(false);
        results[2].isValid.should.be.eq(false);
        results[1].results[0].count.should.be.eq(2);
        results[1].results[0].remaining.should.be.eq(98);
        results[1].results[0].rate.should.be.eq(2);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(3);
        results[2].results[0].count.should.be.eq(3);

        await Promises.delay(5100);

        let result2 = await handler.reserve({key, roles, type: RateLimitType.FixedWindow});

        result2.isValid.should.be.eq(false);
        result2.results[0].count.should.be.eq(4);
        result2.results[0].rate.should.be.eq(2);
        result2.results[0].remaining.should.be.eq(96);
        result2.results[0].reset.should.be.lte((1000 * 60 * 5) - 5000);
    });


    it("should multi frequency cap", async () => {

        let arr = Array(3).fill(1);
        let key = "test";
        let roles = [{
            interval: 1000 * 60 * 5,
            limit: 100,
            spread: 1.67
        }, {
            interval: 1000 * 60,
            limit: 60,
            spread: 1
        }]

        let results = await Promises.map(arr, item => handler.reserve({key, roles}), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(false);
        results[2].isValid.should.be.eq(false);

        results[1].results[0].isValid.should.be.eq(false);

        results[2].isValid.should.be.eq(false);
        results[1].results[0].count.should.be.eq(1);

        results[1].results[0].remaining.should.be.eq(99);
        results[1].results[0].rate.should.be.eq(2);
        results[1].results[0].rateLimit.should.be.eq(1.67);
        results[2].results[0].rate.should.be.eq(2);
        results[2].results[0].count.should.be.eq(1);

        await Promises.delay(1000);

        let result2 = await handler.reserve({key, roles});

        result2.isValid.should.be.eq(false);
        result2.results.length.should.be.eq(1);

        await Promises.delay(5000);

        result2 = await handler.reserve({key, roles});

        result2.results[0].count.should.be.eq(2);

        result2.results[1].count.should.be.eq(2);
        result2.results[0].remaining.should.be.eq(98);
        result2.results[1].remaining.should.be.eq(58);
    });

    it("should  frequency cap no spread", async () => {

        let arr = Array(5).fill(1);

        let key = "test";
        let roles = [{
            interval: 1000 * 60 * 5,
            limit: 100
        }];


        let results = await Promises.map(arr, item => handler.reserve({key, roles}), {concurrency: 100});

        results[0].isValid.should.be.eq(true);
        results[1].isValid.should.be.eq(true);
        results[4].isValid.should.be.eq(true);

        results[4].results[0].count.should.be.eq(5);

        results[4].results[0].remaining.should.be.eq(95);
    });


});
