import {define, inject, singleton} from "appolo";
import {WindowCalculator} from "./windowCalculator";
import {IRole, IRoles} from "./common/IRole";
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
    slim?: boolean
    force?: boolean
}


@define()
@singleton()
export class RateLimiterMarshal {

    @inject() private windowCalculator: WindowCalculator;


    public prepareParams(roles: IRoles, check: boolean): ISlidingWindowParams[] {

        let dto: ISlidingWindowParams[] = [];

        for (let i = 0, len = roles.roles.length; i < len; i++) {

            let role = roles.roles[i];

            let {interval, limit, spread, bucket} = role;

            bucket = this.windowCalculator.calcBucketInterval({interval, limit, spread, bucket});

            spread = this.windowCalculator.calcRateLimit({interval, limit, spread, bucket});

            let now = Date.now();
            let dtoParams: ISlidingWindowParams = {
                window: bucket,
                interval: role.interval,
                limit: role.limit,
                reserve: role.reserve || 1,
                rateLimit: spread.toString(),
                check: check,
                slim: !!roles.slim,
                force: !!role.forceUpdate,
                maxWindow: roles.type == RateLimitType.FixedWindow ? ((role.start || now) + role.interval) : 0
            };

            if (dtoParams.maxWindow && dtoParams.maxWindow < now) {
                throw new Error("start time + interval is lower then current date")
            }

            dto.push(dtoParams);
        }

        return dto;
    }

    public prepareResults(params: ISlidingWindowParams[], results: (any)[][]): IResults {

        let isValid: boolean = true;

        let dto: IResult[] = [];

        for (let i = 0, len = results.length; i < len; i++) {
            let item = results[i], param = params[i];

            if (!param.slim) {
                dto.push({
                    count: item[1],
                    bucket: param.window,
                    remaining: param.limit - (item[1]),
                    limit: param.limit,
                    rateLimit: parseFloat(param.rateLimit),
                    rate: parseFloat(item[2]),
                    isValid: !!item[0],
                    reset: item[3],
                    retry: item[4]
                });
            }

            if (!item[0]) {
                isValid = false
            }
        }

        return {
            results: dto,
            isValid
        };
    }

}
