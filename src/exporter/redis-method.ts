import util from "util";
import { RedisClient } from "redis";

export type REDIS_METHOD = {
  get: (arg1: string) => Promise<string | null>;
  set: (arg1: string, arg2: string) => Promise<unknown>;
  expire: (arg1: string, arg2: number) => Promise<number>;
  append: (arg1: string, arg2: string) => Promise<number>;
};
/**
 *
 * @param cache
 * @returns
 * util.promisify will create a promise. cache instance is passed as a this keyword.
 * bind will create a new funtion and also has a redisclient instance with it.
 * set will create/overwrite the data for the key value pair in the redis.
 * expiry will create/overwrite the expiry for the key specified for a particular time passed.
 * append will create/append the data for the key value pair in the redis.
 * get will fetch the data for the given key from the redis if exists.
 */
export const redisCrudMethods = (cache: RedisClient): REDIS_METHOD => {
  const set = util.promisify(cache.SET).bind(cache);
  const expire = util.promisify(cache.EXPIRE).bind(cache);
  const append = util.promisify(cache.APPEND).bind(cache);
  const get = util.promisify(cache.GET).bind(cache);
  return { get, set, expire, append };
};
