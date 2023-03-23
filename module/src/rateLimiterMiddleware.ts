import {define, singleton, inject} from '@appolo/inject';
import {Middleware, IResponse, IRequest, NextFn, next, req, res, context} from '@appolo/route';
import {RateLimiter} from "./rateLimiter";
import {IRole, IRoles} from "./common/IRole";

@define()
@singleton()
export class RateLimiterMiddleware extends Middleware {
    @inject() rateLimiter: RateLimiter;

    public async run(@context() context: { keyGenerator: (req: IRequest) => string, config: IRole }, @req() req: IRequest, @res() res: IResponse, @next() next: NextFn) {

        const {keyGenerator, config} = context;

        const key = keyGenerator(req);

        const result = await this.rateLimiter.reserve({
            key,
            roles: [config]
        })

        if (!result.isValid) {
            return this.sendError("Too many requests", 429);
        }
        next();

    }
}
