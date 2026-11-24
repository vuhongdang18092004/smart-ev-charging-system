import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { BLOG_PAGE_SIZE } from "@/constants/blog";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type { BlogFilters, BlogPost, BlogPostRequest } from "@/types/blog";
import type { PaginatedResponse } from "@/types/management";

export async function getBlogPosts(
  filters: BlogFilters,
  page: number,
  signal: AbortSignal,
) {
  const { data } = await axiosClient.get<
    ApiSuccess<PaginatedResponse<BlogPost>>
  >(API_ENDPOINTS.blogPosts, {
    params: { ...filters, page, size: BLOG_PAGE_SIZE },
    signal,
  });
  return data.data;
}

export async function getBlogPost(id: string, signal: AbortSignal) {
  const { data } = await axiosClient.get<ApiSuccess<BlogPost>>(
    API_ENDPOINTS.blogPost(id),
    { signal },
  );
  return data.data;
}

export async function saveBlogPost(body: BlogPostRequest, id?: string) {
  if (id) await axiosClient.put(API_ENDPOINTS.blogPost(id), body);
  else await axiosClient.post(API_ENDPOINTS.blogPosts, body);
}

export async function moderateBlogPost(
  id: string,
  action: "submit" | "approve" | "reject",
  reason?: string,
) {
  await axiosClient.post(
    API_ENDPOINTS.blogPostAction(id, action),
    reason === undefined ? {} : { rejection_reason: reason },
  );
}

export async function deleteBlogPost(id: string) {
  await axiosClient.delete(API_ENDPOINTS.blogPost(id));
}
