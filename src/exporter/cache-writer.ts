import { Writable } from "stream";
import { Logger } from "../utils/logger";
import { ExportStatus, STATUS } from "../model/export-model";
import { updateStatusAndExpiry, appendData } from "./add-to-redis";
import { REDIS_METHOD } from "./redis-method";

/**
 *
 * @param exportId
 * @param cache
 * @param logger
 * @returns Writable
 * write function append the chunk to the redis.
 * final is called when write is succesfully completed.
 */

export const newCacheWriter = (
  exportId: string,
  crud: REDIS_METHOD,
  logger: Logger
): Writable => {
  const writable = new Writable({
    async write(chunk, _, callback) {
      await appendData(exportId, crud, logger, chunk);
      callback();
    },
    async final(callback) {
      logger(`final blocked called`);
      const newStatus = { status: STATUS.COMPLETED, id: exportId };
      await updateStatusAndExpiry(exportId, crud, logger, newStatus);
      callback();
    },
  });
  writable.on("unpipe", async () => {
    logger(`writable Stream unpiped`);
    const newStatus: ExportStatus = {
      status: STATUS.CANCELLED,
      id: exportId,
    };
    await updateStatusAndExpiry(exportId, crud, logger, newStatus);
  });
  writable.on("close", () => {
    logger(`writable Stream closed`);
  });
  return writable;
};
