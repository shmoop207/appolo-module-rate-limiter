import {module, Module, IModuleParams} from '@appolo/engine';
import {IOptions} from "./src/common/IOptions";

import * as _ from "lodash";
import {RateLimiter} from "./src/rateLimiter";

@module()
export class RateLimiterModule extends Module<IOptions> {

    protected readonly Defaults = <Partial<IOptions>>{
        id: "rateLimiter",
        keyPrefix: "rl",
        maxBuckets: 600,
        minBucketInterval: 5000

    };

    public static for(options?: IOptions): IModuleParams {
        return {type: RateLimiterModule, options}
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: RateLimiter}];

    }

}
