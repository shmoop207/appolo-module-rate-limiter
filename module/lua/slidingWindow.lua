redis.replicate_commands()

local redistime = redis.call("TIME")
local mili = math.floor((redistime[1] * 1e3) + (redistime[2] / 1e6))
local output = {}

local limits = cjson.decode(ARGV[1]);

for i, item in ipairs(limits) do

    local setKey = KEYS[1] .. ':' .. item.interval .. ':set'
    local hashKey = KEYS[1] .. ':' .. item.interval .. ':buckets'

    local currentWindow = math.floor(mili / item.window) * item.window

    local lastUpdate = tonumber(redis.call("HGET", hashKey, "lastUpdate") or '0')

    if (currentWindow > lastUpdate and item.maxWindow == 0) then
        local startWindow = mili - (item.interval)
        local expiredBuckets = redis.call("ZREVRANGEBYSCORE", setKey, startWindow, "-inf")

        if #expiredBuckets > 0 then

            for j, bucket in ipairs(expiredBuckets) do
                redis.call("HINCRBY", hashKey, "counter", -tonumber(redis.call("HGET", hashKey, bucket)))
                redis.call('HDEL', hashKey, bucket)
            end

            redis.call("ZREMRANGEBYSCORE", setKey, "-inf", startWindow)
        end
    end

    local count = tonumber(redis.call("HGET", hashKey, "counter") or '0');
    local rate = 0;
    local isValid = true

    if count + item.reserve > item.limit then
        isValid = false;
    end

    local rateLimit = tonumber(item.rateLimit)

    if rateLimit > 0 then

        local prevBucketCounter = tonumber(redis.call("HGET", hashKey, currentWindow - item.window) or '0');
        local currentBucketCounter = tonumber(redis.call("HGET", hashKey, currentWindow) or '0');
        rate = ((prevBucketCounter * ((item.window - (mili - currentWindow)) / item.window)) + (currentBucketCounter));

        if (rate > rateLimit or currentBucketCounter >= rateLimit) then
            isValid = false
        end
    end
    if isValid == true and not item.check then

        if currentWindow > lastUpdate then

            local expire = item.interval;
            local shouldExpire = true;

            if item.maxWindow > 0 then
                shouldExpire = (redis.call("PTTL", setKey) <= 0);
                expire =  item.maxWindow - mili;
            end

            redis.call("ZADD", setKey, currentWindow, currentWindow)

            if shouldExpire then
                redis.call("HSET", hashKey, "lastUpdate", mili)
                lastUpdate = mili;
                redis.call("PEXPIRE", setKey, expire)
                redis.call("PEXPIRE", hashKey, expire)
            end

        end

        redis.call("HINCRBY", hashKey, currentWindow, item.reserve)
        count = redis.call("HINCRBY", hashKey, "counter", item.reserve)
    end

    table.insert(output, { count, tostring(rate), isValid, (item.interval + lastUpdate) - mili, item.window + currentWindow - mili })

    if not isValid then
        break
    end

end

return output;

