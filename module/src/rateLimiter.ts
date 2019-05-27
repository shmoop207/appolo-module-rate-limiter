import {define, inject, singleton} from "appolo";
import {IOptions} from "./common/IOptions";
import {RedisProvider} from "@appolo/redis";
import {RateLimiterMarshal} from "./rateLimiterMarshal";
import {RateLimitType} from "./common/rateLimitType";
import {IRoles} from "./common/IRole";
import {IResults} from "./common/IResults";

@define()
@singleton()
export class RateLimiter {

    @inject() private moduleOptions: IOptions;
    @inject(RedisProvider) private _redisProvider: RedisProvider;
    @inject() private rateLimiterMarshal: RateLimiterMarshal;


    public reserve({key, roles, type = RateLimitType.SlidingWindow}: IRoles) {
        return this._run({key, roles, type, check: false})
    }

    public check({key, roles, type = RateLimitType.SlidingWindow}: IRoles) {
        return this._run({key, roles, type, check: true})
    }

    private async _run({key, roles, type, check}: IRoles & { check: boolean }): Promise<IResults> {

        let redisKey = `${this.moduleOptions.keyPrefix}:${type == RateLimitType.FixedWindow ? "lmt" : "frq"}:{${key}}`;

        let params = this.rateLimiterMarshal.prepareParams(roles, type, check);

        let results = await this.redisProvider.runScript<number[][]>("slidingWindow", [redisKey], [JSON.stringify(params)], false);

        let dto = this.rateLimiterMarshal.prepareResults(params, results);

        return dto;
    }

    public async clear(key: string) {
        await this.redisProvider.delPattern(`${this.moduleOptions.keyPrefix}*{${key}}*`)
    }

    public get redisProvider(): RedisProvider {
        return this._redisProvider
    }

}
