"use strict";
const redis_1 = require("@appolo/redis");
const logger_1 = require("@appolo/logger");
module.exports = async function (app, env, moduleOptions) {
    if (!app.injector.getInstance("logger")) {
        await app.module(logger_1.LoggerModule);
    }
    await app.module(new redis_1.RedisModule({
        connection: moduleOptions.connection,
        scripts: [{ name: "slidingWindow", path: __dirname + "../../../lua/slidingWindow.lua", args: 1 }]
    }));
};
//# sourceMappingURL=all.js.map