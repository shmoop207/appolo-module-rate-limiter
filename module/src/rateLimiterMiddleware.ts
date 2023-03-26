import {define, singleton, inject} from '@appolo/inject';
import {StaticMiddleware, IResponse, IRequest, NextFn, next, req, res, context,HttpError} from '@appolo/route';
import {RateLimiter} from "./rateLimiter";
import {IRole, IRoles} from "./common/IRole";

@define()
export class RateLimiterMiddleware extends  StaticMiddleware{
    @inject() rateLimiter: RateLimiter;

    public async run(@context() context: { keyGenerator: (req: IRequest) => string, config: IRole }, @req() req: IRequest, @res() res: IResponse, @next() next: NextFn) {

        const {keyGenerator, config} = context;

        const key = keyGenerator(req);

        const result = await this.rateLimiter.reserve({
            key,
            roles: [config]
        })

        if (!result.isValid) {

            return next(new HttpError(429,"Too many requests"));
        }
        next();

    }
}
