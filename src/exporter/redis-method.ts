import util from "util";
import { RedisClient } from "redis";

export type REDIS_METHOD = {
  get: (arg1: string) => Promise<string | null>;
  set: (arg1: string, arg2: string) => Promise<unknown>;
  expire: (arg1: string, arg2: number) => Promise<number>;
  append: (arg1: string, arg2: string) => Promise<number>;
};

export const redisCrudMethods = (cache: RedisClient): REDIS_METHOD => {
  const set = util.promisify(cache.SET).bind(cache);
  const expire = util.promisify(cache.EXPIRE).bind(cache);
  const append = util.promisify(cache.APPEND).bind(cache);
  const get = util.promisify(cache.GET).bind(cache);
  return { get, set, expire, append };
};
