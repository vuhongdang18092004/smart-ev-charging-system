import type { BLOG_STATUS } from "@/constants/blog";
import type { WebUser } from "./web-auth";

export type BlogStatus = (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS];

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  thumbnail_url: string | null;
  status: BlogStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostRequest {
  title: string;
  summary?: string;
  content: string;
  thumbnail_url?: string;
  status?: BlogStatus;
}

export interface BlogFilters {
  keyword?: string;
  status?: BlogStatus;
  authorId?: string;
}

export interface BlogPageProps {
  user: WebUser;
}

export interface BlogDialogProps {
  id: string;
  user: WebUser;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export interface BlogFormProps {
  admin: boolean;
  post?: BlogPost;
  onSuccess: () => void;
}

export type BlogAction = "edit" | "submit" | "approve" | "reject" | "delete";
