import {module, Module, Util} from 'appolo';
import {IOptions} from "./src/IOptions";

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

    constructor(options: IOptions) {
        super(options)
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: RateLimiter}];

    }

}
