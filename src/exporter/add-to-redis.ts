import { Logger } from "../utils/logger";
import { ExportStatus, STATUS } from "../model/export-model";
import { getExportStatus } from "./get-status";
import { REDIS_METHOD } from "redis-method";

const EXPIRY_TIME = 60 * 60;

/**
 *
 * @param exportId
 * @param cache
 * @param logger
 * Add expiry to the status and the data
 */
const addExpiry = async (
  key: string,
  crud: REDIS_METHOD,
  logger: Logger,
  expiryTime: number
): Promise<void> => {
  const { expire } = crud;
  const exp = await expire(key, expiryTime);
  if (exp === 1) {
    logger(`Expiry added for :: ${key}`);
  } else {
    logger(`Expiry not added for :: ${key}`);
  }
};

/**
 *
 * @param exportId
 * @param cache
 * @param logger
 * @param newStatus
 */

const setData = async (
  key: string,
  crud: REDIS_METHOD,
  logger: Logger,
  data: string
): Promise<void> => {
  const { set } = crud;
  const setResult = await set(key, data);
  if (setResult === "OK") {
    logger(`Data ${data} Updated for key:: ${key}`);
  } else {
    logger(`Data ${data} not Updated for key:: ${key}`);
  }
};

/**
 *
 * @param exportId
 * @param cache
 * @param logger
 * This will update the status to status passed in the argruments only if the current status in redis is not COMPLETED
 */
const updateStatusAndExpiry = async (
  exportId: string,
  crud: REDIS_METHOD,
  logger: Logger,
  newStatus: ExportStatus
) => {
  const { get } = crud;
  const { status: currentStatus } = await getExportStatus(exportId, get);
  if (currentStatus !== STATUS.COMPLETED) {
    await setData(exportId, crud, logger, JSON.stringify(newStatus));
    await addExpiry(exportId + "-data", crud, logger, EXPIRY_TIME);
    await addExpiry(exportId, crud, logger, EXPIRY_TIME);
    logger(`Export ${newStatus.status} for export id  :: ${exportId}`);
  }
};

/**
 *
 * @param exportId
 * @param crud
 * @param logger
 * @param chunk
 */
const appendData = async (
  exportId: string,
  crud: REDIS_METHOD,
  logger: Logger,
  chunk: any
) => {
  const { append } = crud;
  await append(exportId + "-data", chunk.toString("binary"));
  const newStatus = { status: STATUS.PENDING, id: exportId };
  await setData(exportId, crud, logger, JSON.stringify(newStatus));
};

export { setData, updateStatusAndExpiry, appendData };
