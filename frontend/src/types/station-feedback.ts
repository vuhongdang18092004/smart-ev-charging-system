export type MediaType = "image" | "video";
export type ReportIssue =
  "broken" | "occupied_wrong" | "closed" | "wrong_info" | "other";
export type ReportStatus = "pending" | "verified" | "rejected";

export interface MediaAttachment {
  id: string;
  media_type: MediaType;
  url: string;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface MediaRequest {
  media_type: MediaType;
  url: string;
  thumbnail_url?: string | null;
  sort_order?: number | null;
}

interface StationFeedbackRecord {
  id: string;
  station_id: string;
  driver_id: string;
  created_at: string | null;
  updated_at: string | null;
  media: MediaAttachment[];
}

export interface Review extends StationFeedbackRecord {
  rating: number;
  comment: string | null;
  edit_count: number | null;
}

export interface StationReport extends StationFeedbackRecord {
  connector_type_id: string | null;
  issue_type: ReportIssue;
  note: string | null;
  status: ReportStatus | null;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string | null;
  media?: MediaRequest[] | null;
}
export interface CreateReviewRequest extends UpdateReviewRequest {
  driver_id: string;
}
export interface StationReportRequest {
  driver_id: string;
  connector_type_id?: string | null;
  issue_type: ReportIssue;
  note?: string | null;
  media?: MediaRequest[] | null;
}
