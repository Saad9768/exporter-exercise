import "regenerator-runtime/runtime";
import { HBExporter, HBExporterDependencies } from "../src/exporter/exporter";
import { createClient } from "redis-mock";
import { MockUUIDGen } from "../src/utils/uuid";
import { MockPermissions } from "../src/permission/permissions";
import { createReadStream } from "fs";
import { sleep } from "../src/utils/index";
import { STATUS } from "../src/model/export-model";

describe("Test stop export", () => {
  const redisClient = createClient();
  const exporterDeps: HBExporterDependencies = {
    cache: redisClient,
    UUIDGen: MockUUIDGen,
    allowedPermission: "test",
    permissionsService: MockPermissions,
    logger: jest.fn(),
  };
  const myUser = {
    id: "1",
    permissions: ["test"],
  };

  const exporter = HBExporter(exporterDeps);
  it("should stop the export and status should be CANCELLED", async () => {
    try {
      const { id, stopExport } = await exporter.StartExport(
        myUser,
        createReadStream("myexport.txt", {
          encoding: "utf8",
          autoClose: true,
        })
      );
      await sleep(5);
      stopExport();
      await sleep(10);
      const { status } = await exporter.GetExportStatus(id);
      expect(status).toEqual(STATUS.CANCELLED);
    } catch (e) {
      throw new Error(e);
    }
  });
  it("should stop the export and status should be COMPLETED", async () => {
    try {
      const { id, stopExport } = await exporter.StartExport(
        myUser,
        createReadStream("myexport.txt", {
          encoding: "utf8",
          autoClose: true,
        })
      );
      await sleep(100);
      stopExport();
      await sleep(10);
      const { status } = await exporter.GetExportStatus(id);
      expect(status).toEqual(STATUS.COMPLETED);
    } catch (e) {
      throw new Error(e);
    }
  });
});
