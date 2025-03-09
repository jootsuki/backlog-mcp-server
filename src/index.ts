#!/usr/bin/env node
import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// .envファイルを読み込む
config();
import { BacklogClient } from './backlog/client.js';
import {
  searchIssuesSchema,
  getIssueSchema,
  updateIssueSchema,
  getProjectsSchema,
  SearchIssuesArgs,
  GetIssueArgs,
  UpdateIssueArgs
} from './backlog/schemas.js';

// 環境変数から設定を取得
const BACKLOG_SPACE_URL = process.env.BACKLOG_SPACE_URL;
const BACKLOG_API_KEY = process.env.BACKLOG_API_KEY;

if (!BACKLOG_SPACE_URL || !BACKLOG_API_KEY) {
  throw new Error('BACKLOG_SPACE_URL and BACKLOG_API_KEY environment variables are required');
}

class BacklogMcpServer {
  private server: Server;
  private backlogClient: BacklogClient;

  constructor() {
    this.server = new Server(
      {
        name: 'backlog-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 環境変数の存在は上でチェック済みなので、型アサーションを使用
    this.backlogClient = new BacklogClient(
      BACKLOG_SPACE_URL as string,
      BACKLOG_API_KEY as string
    );

    this.setupToolHandlers();

    // エラーハンドリング
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private validateAndCastArguments<T>(args: Record<string, unknown> | undefined, schema: any): T {
    if (!args) {
      throw new McpError(ErrorCode.InvalidParams, 'Arguments are required');
    }

    // 基本的な型チェック（実際のプロダクションコードではより厳密な検証が必要）
    for (const [key, value] of Object.entries(schema.properties)) {
      if (schema.required?.includes(key) && !(key in args)) {
        throw new McpError(ErrorCode.InvalidParams, `Missing required argument: ${key}`);
      }
    }

    return args as T;
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'getProjects',
          description: 'Backlogのプロジェクト一覧を取得します',
          inputSchema: getProjectsSchema,
        },
        {
          name: 'searchIssues',
          description: 'Backlogの課題を検索します',
          inputSchema: searchIssuesSchema,
        },
        {
          name: 'getIssue',
          description: '特定のBacklog課題を取得します',
          inputSchema: getIssueSchema,
        },
        {
          name: 'updateIssue',
          description: 'Backlog課題を更新します',
          inputSchema: updateIssueSchema,
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'getProjects': {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.backlogClient.getProjects(),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'searchIssues': {
            const args = this.validateAndCastArguments<SearchIssuesArgs>(
              request.params.arguments,
              searchIssuesSchema
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.backlogClient.searchIssues(args),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'getIssue': {
            const args = this.validateAndCastArguments<GetIssueArgs>(
              request.params.arguments,
              getIssueSchema
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.backlogClient.getIssue(args),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'updateIssue': {
            const args = this.validateAndCastArguments<UpdateIssueArgs>(
              request.params.arguments,
              updateIssueSchema
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.backlogClient.updateIssue(args),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        console.error('[Tool Error]', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${request.params.name}: ${(error as Error).message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Backlog MCP server running on stdio');
  }
}

const server = new BacklogMcpServer();
server.run().catch(console.error);