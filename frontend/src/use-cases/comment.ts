import { commentApi, type CommentApi } from "@/api/comment";
import type { Comment, CreateCommentPayload, ListCommentsParams, RateCommentResponse } from "@/types/comment";
import { UseCases } from "@/use-cases/use-cases";

export class CommentUseCases extends UseCases<Comment> {
  private apiImpl: CommentApi;

  constructor(api: CommentApi) {
    super(api);
    this.apiImpl = api;
  }

  async fetch(params?: ListCommentsParams) {
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

  async fetchForVideo(video: string, opts?: { ordering?: ListCommentsParams["ordering"]; parent?: string }) {
    return this.apiImpl.fetch({ video, ordering: opts?.ordering, parent: opts?.parent });
  }
}

export const commentUseCases = new CommentUseCases(commentApi);
