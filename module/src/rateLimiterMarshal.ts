import {define, inject, singleton} from "appolo";
import {WindowCalculator} from "./windowCalculator";
import {IRole} from "./common/IRole";
import {RateLimitType} from "./common/rateLimitType";
import {IResult, IResults} from "./common/IResults";


interface ISlidingWindowParams {
    window: number,
    interval: number,
    limit: number,
    reserve: number,
    rateLimit: string,
    check: boolean
    maxWindow?: number
}


@define()
@singleton()
export class RateLimiterMarshal {

    @inject() private windowCalculator: WindowCalculator;


    public prepareParams(roles: IRole[], type: RateLimitType, check: boolean): ISlidingWindowParams[] {

        let dto: ISlidingWindowParams[] = [];

        for (let i = 0, len = roles.length; i < len; i++) {

            let role = roles[i];

            let {interval, limit, spread, bucket} = role;

            bucket = this.windowCalculator.calcBucketInterval({interval, limit, spread, bucket});

            spread = this.windowCalculator.calcRateLimit({interval, limit, spread, bucket});

            dto.push({
                window: bucket,
                interval: role.interval,
                limit: role.limit,
                reserve: role.reserve || 1,
                rateLimit: spread.toString(),
                check: check,
                maxWindow: type == RateLimitType.FixedWindow ? (role.start || Date.now() + role.interval) : 0
            });
        }

        return dto;
    }

    public prepareResults(params: ISlidingWindowParams[], results: (any)[][]): IResults {

        let isValid: boolean = true;

        let dto: IResult[] = [];

        for (let i = 0, len = results.length; i < len; i++) {
            let item = results[i], param = params[i];

            dto.push({
                count: item[0],
                bucket: param.window,
                remaining: param.limit - (item[0]),
                limit: param.limit,
                rateLimit: parseFloat(param.rateLimit),
                rate: parseFloat(item[1]),
                isValid: !!item[2],
                reset: item[3],
                retry: item[4]
            });

            if (!item[2]) {
                isValid = false
            }
        }

        return {
            results: dto,
            isValid
        };
    }

}
