import {App} from 'appolo';

import {RedisModule} from '@appolo/redis';
import {LoggerModule} from '@appolo/logger';
import {IEnv} from "../env/IEnv";
import {IOptions} from "../../src/common/IOptions";


export = async function (app: App, env: IEnv, moduleOptions: IOptions) {

    if (!app.injector.getInstance("logger")) {
        await app.module(LoggerModule)
    }

    await app.module(new RedisModule({
        connection: moduleOptions.connection,
        scripts: [{name: "slidingWindow", path: __dirname + "../../../lua/slidingWindow.lua", args: 1}]
    }));


}
