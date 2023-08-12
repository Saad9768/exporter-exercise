import { Stream } from "stream";
import { User } from "./permission-model";

export interface Exporter {
  StartExport: (user: User, data: Stream) => Promise<ExportStatus & StopExport>;
  GetExportStatus: (id: string) => Promise<ExportStatus>;
}

export type ExportStatus = {
  status: STATUS;
  id: string;
};

type StopExport = {
  stopExport: () => void;
};

export enum STATUS {
  CREATED = "CREATED",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
