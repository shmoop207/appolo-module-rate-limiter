# Appolo RateLimit Module

RateLimit module for [`appolo`](https://github.com/shmoop207/appolo) built with [`Redis`](https://redis.io/)

## Installation

```typescript
npm i @appolo/rate-limiter
```

## Options
| key | Description | Type | Default
| --- | --- | --- | --- |
| `id` | `RateLimiter` injection id | `string`|  `rateLimiter`|
| `connection`| `redis` connection string|  `string`|
| `keyPrefix`| redis key prefix|  `string`| `rl`
| `maxBuckets`| max number of buckets|  `number`| `600`
| `minBucketInterval`| min bucket interval in milisec|  `number`| `5000`


in config/modules/all.ts

```typescript
import {RateLimiterModule} from '@appolo/rate-limiter';

export = async function (app: App) {
    await app.module(new RateLimiterModule({connection:process.env.REDIS}));
    
}
```

## Usage
```typescript
import {define, singleton,inject} from 'appolo'
import {RateLimiter} from "@appolo/rate-limiter";


@define()
@singleton()
export class SomeManager {

    @inject() rateLimiter: RateLimiter;

    async checkLimits(): Promise<boolean> {
        let result = await this.rateLimiter.frequency.reserve({
            key:"someKey",
            limits:[{
                interval:10 * 60 * 1000, //10 min
                limit:100,
                spread:true
            }]
        })

        return result.isValid;
    }
}

```

## RateLimiter

### `frequency.reserve(limits: ILimits)`
reserve key using sliding window
#### Options
- `key` - key string
- `limits` - array of limits
    - `interval` -  number of miliseconds in a sliding window
    - `limit` -  max number of items in a sliding window
    - `spread` - `true` to limit by rate per bucket spread evenly default `false`
    - `reserve` - the amount items to reserve default `1`
    - `bucket` - bucket interval in milisec - if not defined will be set automatically

#### Results 
- `isValid` - true if all the limits are valid
- `results` - array of limit results
    - `count` -  current limit count
    - `bucket` -  bucket interval in milisec
    - `remaining` -  remaining limit of the key
    - `rateLimit` -  if spread defined the rate limit per bucket
    - `rate` - if spread defined  - current rate
    - `reset` - the number of milisec until the limit will reset to its maximum capacity
    - `retry` - the number of milisec until bucket reset

```typescript
import {define, singleton,inject} from 'appolo'
import {RateLimiter} from "@appolo/rate-limiter";


@define()
@singleton()
export class SomeManager {

    @inject() rateLimiter: RateLimiter;

    async checkLimits(): Promise<boolean> {
        let result = await this.rateLimiter.frequency.reserve({
            key:"someKey",
            limits:[{
                interval:10 * 60 * 1000, //10 min
                limit:100,
                spread:true,
                reserve:100
            }]
        })

        return result.isValid;
    }
}

```

### `frequency.check(limits: ILimits)`
check key using sliding window the counters won't be updated
#### Options
same as `frequency.reserve` options
#### Results  
same as `frequency.reserve` results
 
### `limit.reserve(limits: ILimits)`
 reserve key using fixed limit interval
#### Options
- `key` - key string
- `limits` - array of limits
    - `interval` -  number of miliseconds in a sliding window
    - `limit` -  max number of items in a sliding window
    - `spread` - `true` to limit by rate per bucket spread evenly default `false`
    - `reserve` - the amount items to reserve default `1`
    - `bucket` - bucket interval in milisec - if not defined will be set automatically
    - `start` - start point of the interval default `Date.now()`

#### Results 
same as `frequency.reserve` results

### `limit.check(limits: ILimits)`
check key using fixed limit interval the counters won't be updated
#### Options
same as `limit.reserve` options
#### Results  
same as `limit.reserve` results
