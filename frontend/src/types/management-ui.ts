import type { ReactNode } from "react";
import type { TableColumn } from "./base-components";
import type {
  Brand,
  Connector,
  ConnectorType,
  Operator,
  Station,
} from "./management";

export interface ResourceState<T> {
  load: (signal: AbortSignal) => Promise<T>;
  revision: number;
  data?: T;
  error?: unknown;
}

export interface WorkspaceProps {
  children: ReactNode;
}
export interface ManagedFormProps extends WorkspaceProps {
  submit: (form: FormData) => Promise<unknown>;
  onSuccess: () => void;
  submitLabel: string;
  disabled?: boolean;
}
export interface ResourceFeedbackProps {
  loading: boolean;
  error?: unknown;
  refresh: () => void;
}
export interface SectionHeadingProps {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  disabled?: boolean;
}
export interface CatalogPageProps<Row> extends WorkspaceProps {
  title: string;
  description: string;
  action: string;
  load: (signal: AbortSignal) => Promise<Row[]>;
  columns: readonly TableColumn<Row>[];
  submit: (form: FormData) => Promise<unknown>;
}

interface StationReferences {
  brands: Brand[];
  operators: Operator[];
  types: ConnectorType[];
}
export interface StationFormProps extends StationReferences {
  station?: Station;
  onSuccess: () => void;
}
export interface StationDetailsProps extends StationReferences {
  id: string;
  onClose: () => void;
  onChange: () => void;
  onDelete: () => void;
}
export interface ConnectorFieldsProps {
  types: ConnectorType[];
  connector?: Connector;
  prefix?: string;
}
export type StationDetailAction =
  | { kind: "edit-station" }
  | { kind: "delete-station" }
  | { kind: "edit-connector"; connector?: Connector }
  | { kind: "delete-connector"; id: string };
