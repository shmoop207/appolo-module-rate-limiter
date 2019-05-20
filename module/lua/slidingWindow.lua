redis.replicate_commands()

local redistime = redis.call("TIME")
local mili = math.floor((redistime[1] * 1e3) + (redistime[2] / 1e6))
local output = {}

local limits = cjson.decode(ARGV[1]);

for i, item in ipairs(limits) do

    local setKey = KEYS[1] .. ':' .. item.interval .. ':set'
    local hashKey = KEYS[1] .. ':' .. item.interval .. ':buckets'

    local currentWindow = math.floor(mili / item.window) * item.window

    local startWindow = mili - (item.interval)

    local lastUpdate = tonumber(redis.call("HGET", hashKey, "lastUpdate") or '0')

    if currentWindow > lastUpdate then
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

    local spread =  tonumber(item.spread)

    if spread > 0 then

        local prevBucketCounter = tonumber(redis.call("HGET", hashKey, currentWindow - item.window) or '0');
        local currentBucketCounter = tonumber(redis.call("HGET", hashKey, currentWindow) or '0');
        rate = ((prevBucketCounter * ((item.window - (mili - currentWindow)) / item.window)) + (currentBucketCounter));

        if (rate > spread or currentBucketCounter >= spread) then
            isValid = false
        end
    end

    if isValid == true and not item.check then

        if currentWindow > lastUpdate then
            redis.call("ZADD", setKey, currentWindow, currentWindow)
            redis.call("HSET", hashKey, "lastUpdate", mili)
            redis.call("PEXPIRE", setKey, item.interval)
            lastUpdate = mili;
            redis.call("PEXPIRE", hashKey, item.interval)
        end

        redis.call("HINCRBY", hashKey, currentWindow, item.reserve)
        count = redis.call("HINCRBY", hashKey, "counter", item.reserve)
    end

    table.insert(output, { count, tostring(rate), isValid, (item.interval + lastUpdate) - mili, item.window + currentWindow - mili,tostring(count/(item.interval/item.window))})

    if not isValid then
        break
    end

end

return output;

