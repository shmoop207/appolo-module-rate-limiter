import {module, Module, IModuleParams} from '@appolo/engine';
import {IOptions} from "./src/common/IOptions";

import {RateLimiter} from "./src/rateLimiter";
import {RateLimiterMiddleware} from "./src/rateLimiterMiddleware";

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
        return [{id: this.moduleOptions.id, type: RateLimiter},
            RateLimiterMiddleware
        ];

    }

}
