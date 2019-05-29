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


    public reserve(roles: IRoles) {
        return this._run(roles, false)
    }

    public check(roles: IRoles) {
        return this._run(roles, true)
    }

    private async _run(roles: IRoles, check: boolean): Promise<IResults> {

        let redisKey = this._createKey(roles);

        let params = this.rateLimiterMarshal.prepareParams(roles, check);

        let results = await this.redisProvider.runScript<number[][]>("slidingWindow", [redisKey], [JSON.stringify(params)], false);

        let dto = this.rateLimiterMarshal.prepareResults(params, results);

        return dto;
    }

    private _createKey(roles: IRoles): string {
        return `${this.moduleOptions.keyPrefix}:${roles.type == RateLimitType.FixedWindow ? "lmt" : "frq"}:{${roles.key}}`;
    }

    public async clear(key: string) {
        await this.redisProvider.delPattern(`${this.moduleOptions.keyPrefix}*{${key}}*`)
    }

    public get redisProvider(): RedisProvider {
        return this._redisProvider
    }

}
