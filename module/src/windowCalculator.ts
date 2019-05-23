import {define, inject, singleton} from "appolo";
import {IFrequency, IOptions} from "./IOptions";
import {Util} from "./util";


@define()
@singleton()
export class WindowCalculator {

    @inject() private moduleOptions: IOptions;

    public calcBucketInterval({interval, limit, bucket, spread}: Pick<IFrequency, 'interval' | 'limit' | 'bucket' | 'spread'>): number {

        bucket = bucket || Math.floor(interval / this.moduleOptions.maxBuckets);

        bucket = Math.max(bucket, this.moduleOptions.minBucketInterval);

        if (spread) {
            bucket = Math.max(bucket, Math.floor(interval / limit));
        }

        return bucket;
    }

    public calcRateLimit({interval, limit, bucket, spread}: Pick<IFrequency, 'interval' | 'limit' | 'bucket' | 'spread'>): number {
        let rateLimit = 0;

        if (spread) {
            rateLimit = typeof spread == "boolean" ? Util.toFixed((limit / interval) * bucket, 2) : spread;
        }

        return rateLimit;

    }
}
