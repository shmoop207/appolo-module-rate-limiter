import {App, createApp, Util} from 'appolo'
import * as Q from 'bluebird'
import {RateLimiter, RateLimiterModule} from "../index";
import chai = require('chai');
import    sinonChai = require("sinon-chai");


let should = require('chai').should();
chai.use(sinonChai);


describe("PubSub Spec", function () {

    let app: App;


    beforeEach(async () => {

        app = createApp({root: __dirname, environment: "production", port: 8181});

        await app.module(new RateLimiterModule({connection: process.env.REDIS}));

        await app.launch();
    });

    afterEach(async () => {
        await app.reset();
    })

    it("should cache sync", async () => {

        let handler = app.injector.get<RateLimiter>(RateLimiter);

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

        await Util.delay(1000)

    });


});


