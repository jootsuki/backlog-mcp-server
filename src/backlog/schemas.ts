// Backlog API用のスキーマ定義

// 課題検索用のスキーマ
export const searchIssuesSchema = {
  type: 'object',
  properties: {
    projectId: {
      type: 'number',
      description: 'プロジェクトID（数値）',
    },
    keyword: {
      type: 'string',
      description: '検索キーワード',
    },
    status: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'ステータス（未対応、処理中、処理済み、完了）',
    },
  },
  required: ['projectId'],
} as const;

// 課題取得用のスキーマ
export const getIssueSchema = {
  type: 'object',
  properties: {
    issueId: {
      type: 'string',
      description: '課題のID（例: PROJECT-1）',
    },
  },
  required: ['issueId'],
} as const;

// 課題更新用のスキーマ
export const updateIssueSchema = {
  type: 'object',
  properties: {
    issueId: {
      type: 'string',
      description: '課題のID（例: PROJECT-1）',
    },
    status: {
      type: 'string',
      description: '新しいステータス',
    },
    description: {
      type: 'string',
      description: '課題の説明',
    },
    comment: {
      type: 'string',
      description: '更新時のコメント',
    },
  },
  required: ['issueId'],
} as const;

// APIレスポンスの型定義
export interface BacklogIssue {
  id: number;
  issueKey: string;
  summary: string;
  description: string;
  status: {
    id: number;
    name: string;
  };
  assignee?: {
    id: number;
    name: string;
  };
  createdUser: {
    id: number;
    name: string;
  };
  created: string;
  updated: string;
}

// API引数の型定義
export interface SearchIssuesArgs {
  projectId: number;
  keyword?: string;
  status?: string[];
}

export interface GetIssueArgs {
  issueId: string;
}

export interface UpdateIssueArgs {
  issueId: string;
  status?: string;
  description?: string;
  comment?: string;
}

// プロジェクト一覧取得用のスキーマ
export const getProjectsSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false
} as const;