import {get, Controller, controller, middleware, IRequest} from '@appolo/route';
import {RateLimiterMiddleware} from "../../../module/src/rateLimiterMiddleware";

@controller()
export class TestController extends Controller {

    @middleware(RateLimiterMiddleware.for({
        config: {
            interval: 3 * 60 * 1000, //3 min
            limit: 5,
        },
        keyGenerator: (req: IRequest) => "hardcoded_test_key"
    }))
    @get('/hello_world')
    async helloWorld() {
        return this.send(200, "hello world");
    }

}
