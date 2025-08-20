import type { AxiosInstance } from "axios";
import api from "@/api/client";
import { Api } from "@/api/api";
import type { Comment } from "@/types/comment";
import type { CreateCommentPayload, RateCommentResponse, ListCommentsParams } from "@/types/comment";

export class CommentApi extends Api<Comment> {
  constructor(apiClient: AxiosInstance, prefix: string = "comment") {
    super(prefix, apiClient);
  }

  async fetch(params?: ListCommentsParams): Promise<Comment[]> {
    const res = await this.apiClient.get<Comment[]>(`/${this.prefix}/`, { params });
    return res.data;
  }

  async createComment(payload: CreateCommentPayload): Promise<Comment> {
    const res = await this.apiClient.post<Comment>(`/${this.prefix}/`, payload);
    return res.data;
  }

  async updateComment(id: string, data: Pick<CreateCommentPayload, "text">): Promise<Comment> {
    // Use PATCH for partial updates so backend doesn't require full payload (e.g., 'video')
    const res = await this.apiClient.patch<Comment>(`/${this.prefix}/${id}/`, data);
    return res.data;
  }

  async delete(id: string): Promise<Record<string, unknown>> {
    const res = await this.apiClient.delete<Record<string, unknown>>(`/${this.prefix}/${id}/`);
    return res.data;
  }

  async rate(id: string): Promise<RateCommentResponse> {
    const res = await this.apiClient.post<RateCommentResponse>(`/${this.prefix}/${id}/rate/`);
    return res.data;
  }
}

export const commentApi = new CommentApi(api, "comment");
