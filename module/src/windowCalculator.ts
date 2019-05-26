import {define, inject, singleton} from "appolo";
import { IOptions} from "./common/IOptions";
import {Util} from "appolo-utils";
import {IRole} from "./common/IRole";


@define()
@singleton()
export class WindowCalculator {

    @inject() private moduleOptions: IOptions;

    public calcBucketInterval({interval, limit, bucket, spread}: Pick<IRole, 'interval' | 'limit' | 'bucket' | 'spread'>): number {

        bucket = bucket || Math.floor(interval / this.moduleOptions.maxBuckets);

        bucket = Math.max(bucket, this.moduleOptions.minBucketInterval);

        if (spread) {
            bucket = Math.max(bucket, Math.floor(interval / limit));
        }

        return bucket;
    }

    public calcRateLimit({interval, limit, bucket, spread}: Pick<IRole, 'interval' | 'limit' | 'bucket' | 'spread'>): number {
        let rateLimit = 0;

        if (spread) {
            rateLimit = typeof spread == "boolean" ? Util.numbers.toFixed((limit / interval) * bucket, 2) : spread;
        }

        return rateLimit;

    }
}
