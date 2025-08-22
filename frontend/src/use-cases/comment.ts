import { commentApi, type CommentApi } from "@/api/comment";
import type { Comment, CreateCommentPayload, ListCommentsParams, RateCommentResponse } from "@/types/comment";
import { UseCases } from "@/use-cases/use-cases";
import type { Paginated } from "@/types/pagination";

export class CommentUseCases extends UseCases<Comment> {
  private apiImpl: CommentApi;

  constructor(api: CommentApi) {
    super(api);
    this.apiImpl = api;
  }

  // Backward-compatible array response
  async fetch(params?: ListCommentsParams): Promise<Comment[]> {
    const page = await this.apiImpl.fetch(params);
    return page.results;
  }

  // Full paginated variant
  async fetchPaginated(params?: ListCommentsParams): Promise<Paginated<Comment>> {
    return this.apiImpl.fetch(params);
  }

  async createComment(payload: CreateCommentPayload) {
    return this.apiImpl.createComment(payload);
  }

  async updateComment(id: string, text: string) {
    return this.apiImpl.updateComment(id, { text });
  }

  async rate(id: string): Promise<RateCommentResponse> {
    return this.apiImpl.rate(id);
  }

  async fetchForVideo(
    video: string,
    opts?: { ordering?: ListCommentsParams["ordering"]; parent?: string; parent__isnull?: boolean }
  ): Promise<Comment[]> {
    const page = await this.apiImpl.fetch({ video, ...opts });
    return page.results;
  }

  async fetchForVideoPaginated(
    video: string,
    opts?: { ordering?: ListCommentsParams["ordering"]; parent?: string; parent__isnull?: boolean }
  ): Promise<Paginated<Comment>> {
    return this.apiImpl.fetch({ video, ...opts });
  }

  async fetchNext(nextUrl: string): Promise<Paginated<Comment>> {
    return this.api.fetchNext(nextUrl);
  }
}

export const commentUseCases = new CommentUseCases(commentApi);
