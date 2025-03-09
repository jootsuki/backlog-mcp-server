import axios, { AxiosInstance } from 'axios';
import {
  BacklogIssue,
  SearchIssuesArgs,
  GetIssueArgs,
  UpdateIssueArgs
} from './schemas.js';

interface Project {
  id: number;
  projectKey: string;
  name: string;
}

export class BacklogClient {
  private client: AxiosInstance;

  constructor(spaceUrl: string, apiKey: string) {
    // URLの末尾のスラッシュを削除
    const baseUrl = spaceUrl.replace(/\/$/, '');

    this.client = axios.create({
      baseURL: `${baseUrl}/api/v2`,
      params: {
        apiKey: apiKey
      }
    });
  }

  /**
   * 課題を検索
   */
  async searchIssues(args: SearchIssuesArgs): Promise<BacklogIssue[]> {
    try {
      const response = await this.client.get('/issues', {
        params: {
          'projectId[]': [args.projectId],
          keyword: args.keyword,
          'statusId[]': args.status?.map(this.getStatusId),
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Backlog API error: ${error.response?.data.message ?? error.message}`);
      }
      throw error;
    }
  }

  /**
   * 課題を取得
   */
  async getIssue(args: GetIssueArgs): Promise<BacklogIssue> {
    try {
      const response = await this.client.get(`/issues/${args.issueId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Backlog API error: ${error.response?.data.message ?? error.message}`);
      }
      throw error;
    }
  }

  /**
   * 課題を更新
   */
  async updateIssue(args: UpdateIssueArgs): Promise<BacklogIssue> {
    try {
      const params: Record<string, any> = {};

      if (args.status) {
        params.statusId = this.getStatusId(args.status);
      }

      if (args.comment) {
        params.comment = args.comment;
      }

      if (args.description !== undefined) {
        params.description = args.description;
      }

      const response = await this.client.patch(`/issues/${args.issueId}`, params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Backlog API error: ${error.response?.data.message ?? error.message}`);
      }
      throw error;
    }
  }

  /**
   * ステータス名からステータスIDを取得
   */
  private getStatusId(statusName: string): number {
    const statusMap: Record<string, number> = {
      '未対応': 1,
      '処理中': 2,
      '処理済み': 3,
      '完了': 4,
    };

    const statusId = statusMap[statusName];
    if (!statusId) {
      throw new Error(`Invalid status: ${statusName}`);
    }

    return statusId;
  }

  /**
   * プロジェクト一覧を取得
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.client.get('/projects');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Backlog API error: ${error.response?.data.message ?? error.message}`);
      }
      throw error;
    }
  }
}