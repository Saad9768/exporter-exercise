import { ExportStatus } from "../model/export-model";

/**
 *
 * @param exportId
 * @param cache
 * @returns ExportStatus | Error
 * Get the status from the redis
 */

const getExportStatus = async (
  exportId: string,
  get: (arg1: string) => Promise<string | null>
) => {
  const strStatus = await get(exportId);
  if (!strStatus) {
    throw new Error(`no export found for id: ${exportId}`);
  }
  const status: ExportStatus = JSON.parse(strStatus);
  return status;
};

export { getExportStatus };
