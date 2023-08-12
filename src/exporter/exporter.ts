import { RedisClient } from "redis";
import { PermissionsService } from "../model/permission-model";
import { UUID } from "../utils/uuid";
import { Logger } from "../utils/logger";
import { Exporter, ExportStatus, STATUS } from "../model/export-model";
import { getExportStatus } from "./get-status";
import { setData } from "./add-to-redis";
import { newCacheWriter } from "./cache-writer";
import { redisCrudMethods, REDIS_METHOD } from "./redis-method";

export type HBExporterDependencies = {
  cache: RedisClient;
  permissionsService: PermissionsService;
  allowedPermission: string;
  UUIDGen: UUID;
  logger: Logger;
};

export const HBExporter = ({
  logger,
  UUIDGen,
  permissionsService,
  cache,
  allowedPermission,
}: HBExporterDependencies): Exporter => {
  return {
    /**
     *
     * @param user
     * @param data
     * @returns
     */
    StartExport: async (user, data) => {
      try {
        /**
         * set,get,append,expire method with promise is bootstrap below
         */
        const crud: REDIS_METHOD = redisCrudMethods(cache);
        logger(`Starting Export`);
        // authorize user
        const allowed = await permissionsService.CheckPermissions(
          user,
          allowedPermission
        );
        if (!allowed) {
          throw new Error("incorrect permission");
        }
        logger(`user authorized :: `, user);

        const exportId = UUIDGen.NewUUID();
        logger(`new exportId :: ${exportId}`);

        const newStatus = {
          status: STATUS.CREATED,
          id: exportId,
        };
        logger(`Export ${newStatus.status} for export id  :: ${exportId}`);
        await setData(exportId, crud, logger, JSON.stringify(newStatus));
        const writable = newCacheWriter(exportId, crud, logger);
        /**
         * This will attach the read stream to write stream
         */
        data.pipe(writable);
        /*
          count is used stop stopExport function to call twice
          data.close will close the input stream
        */
        let count = 0;
        const stopExport = () => {
          logger(`stop export called count :: ${count + 1}`);
          if (count == 0) {
            data.close(async () => {
              logger(`Input Stream closed`);
              data.unpipe(writable);
              writable.destroy();
            });
            count++;
          }
        };
        return { stopExport, ...newStatus };
      } catch (e) {
        console.log("error");
        throw e;
      }
    },
    /**
     *
     * @param exportId
     * @returns Promise<ExportStatus>
     */
    GetExportStatus: async (exportId): Promise<ExportStatus> => {
      const { get } = redisCrudMethods(cache);
      return getExportStatus(exportId, get);
    },
  };
};
