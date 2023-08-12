import { HBExporter, HBExporterDependencies } from "./exporter/exporter";
import { createClient } from "redis-mock";
import { MockUUIDGen } from "./utils/uuid";
import { MockPermissions } from "./permission/permissions";
import { createReadStream } from "fs";
import { NewMockLogger } from "./utils/logger";

const logger = NewMockLogger("index");

const mockOpenFile = () =>
  createReadStream("myexport.txt", {
    encoding: "utf8",
    autoClose: true,
  });

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const StartApp = async () => {
  logger("starting application");
  const redisClient = createClient();
  const exporterDeps: HBExporterDependencies = {
    cache: redisClient,
    UUIDGen: MockUUIDGen,
    allowedPermission: "exporter",
    permissionsService: MockPermissions,
    logger: NewMockLogger("exporter"),
  };
  const myUser = {
    id: "1",
    permissions: ["exporter"],
  };

  const exporter = HBExporter(exporterDeps);

  try {
    const { id, stopExport } = await exporter.StartExport(
      myUser,
      mockOpenFile()
    );

    await sleep(200);
    stopExport();
    while (1) {
      await sleep(500);
      const result = await exporter.GetExportStatus(id);
      logger(`Got Update :: `, result);
    }
  } catch (e) {
    console.log(e);
  }
};

// Starting application...
StartApp();
