import type { ReactNode } from "react";
import type { TableColumn } from "./base-components";
import type {
  Brand,
  Connector,
  ConnectorType,
  Operator,
  PaginatedResponse,
  Station,
  StationImage,
} from "./management";
import type { MediaAttachment } from "./station-feedback";

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
export interface CatalogPageProps<Row> {
  title: string;
  description: string;
  action: string;
  load: (signal: AbortSignal) => Promise<Row[]>;
  columns: readonly TableColumn<Row>[];
  create: (form: FormData) => Promise<unknown>;
  update: (row: Row, form: FormData) => Promise<unknown>;
  editTitle: string;
  fields: (row?: Row) => ReactNode;
  canEdit?: (row: Row) => boolean;
  remove?: (row: Row) => Promise<unknown>;
  toolbar?: ReactNode;
  secondaryAction?: CatalogSecondaryAction<Row>;
}

interface CatalogSecondaryAction<Row> {
  label: string;
  render: (row: Row, onSuccess: () => void) => ReactNode;
}

export type CatalogDialog<Row> =
  { kind: "create" } | { kind: "edit" | "secondary" | "delete"; row: Row };

export interface AllowedBrandsFormProps {
  operatorId: string;
  onSuccess: () => void;
}

interface StationReferences {
  brands: Brand[];
  operators: Operator[];
  types: ConnectorType[];
}
export interface StationFormProps extends StationReferences {
  operatorLocked?: boolean;
  station?: Station;
  onSuccess: () => void;
}
export interface StationDetailsProps extends StationReferences {
  canManageFeedback: boolean;
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

export interface StationImageFieldsProps {
  image?: StationImage;
  prefix: string;
  primary: boolean;
  onSelectPrimary: () => void;
}

export interface StationImageGalleryProps {
  images: StationImage[];
}

export interface MediaPreviewProps {
  url: string;
  label: string;
  poster?: string | null;
  video?: boolean;
}

export interface FeedbackMediaProps {
  media: MediaAttachment[];
}

export type StationFeedbackKind = "review" | "report";

export interface StationFeedbackProps {
  stationId: string;
  types: ConnectorType[];
  onReviewSubmitted: () => void;
}

export interface StationFeedbackFormProps {
  stationId: string;
  kind: StationFeedbackKind;
  types: ConnectorType[];
  onSuccess: () => void;
}

export type StationFeedbackLoader<T> = (
  stationId: string,
  page: number,
  signal: AbortSignal,
) => Promise<PaginatedResponse<T>>;

export interface FeedbackCollectionProps<T> {
  data?: PaginatedResponse<T>;
  error?: unknown;
  loading: boolean;
  refresh: () => void;
  setPage: (page: number) => void;
  emptyLabel: string;
  renderItem: (item: T) => ReactNode;
}
