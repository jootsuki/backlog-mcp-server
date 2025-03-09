# Backlog MCP Server

BacklogのAPIに接続するMCPサーバーです。課題の検索、取得、更新機能を提供します。

## 機能

- 課題の検索
- 課題の取得
- 課題の更新

## セットアップ

## MCPの設定

`~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`に以下を追加：

```json
{
  "mcpServers": {
    "backlog": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/path/to/backlog-mcp-server"
    }
  }
}
```

注意：`cwd`は実際のプロジェクトパスに置き換えてください。

## Docker環境

### 開発環境

開発やテスト用にDockerコンテナを使用する場合：

```bash
# .envファイルを作成
cp .env.example .env
# 必要な環境変数を設定
BACKLOG_SPACE_URL=https://your-space.backlog.com
BACKLOG_API_KEY=your_api_key

# 開発モードでビルドと起動
NODE_ENV=development docker compose up -d --build
```

開発モードでは、ソースコードの変更を監視し、自動的に再起動します。

### 本番環境

本番環境用にDockerコンテナを使用する場合：

```bash
# .envファイルを作成
cp .env.example .env
# 必要な環境変数を設定
BACKLOG_SPACE_URL=https://your-space.backlog.com
BACKLOG_API_KEY=your_api_key

# 本番モードでビルドと起動
docker compose up -d --build
```

### MCPサーバーとしての使用

Dockerコンテナを使用してMCPサーバーとして実行するには、利用するアプリの設定ファイルに以下のように設定します
Cline、RooClineの例：
`cline_mcp_settings.json`
```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": ["exec", "-i", "backlog-mcp-server", "node", "build/index.js"],
      "env": {
        "BACKLOG_SPACE_URL": "https://your-space.backlog.com",
        "BACKLOG_API_KEY": "your_api_key"
      }
    }
  }
}
```

その他のアプリ設定方法

Claude Desktop：https://ainow.jp/claude-mcp-guide/

Windsurf：https://zenn.dev/y16ra/articles/3ed3e2ae734fa4

Cursor：https://note.com/shuzon__/n/na2aafacf7324 →[Notion MCP Server を Cursor に設定]


## プロンプト例

```md
# 課題の検索
・バックログのPROJECT1-100の課題を説明して
・バックログのPROJECT1のプロジェクトで処理中の課題を教えて

# 課題の更新
・PROJECT1-100の課題のステータスを完了にして
・PROJECT1-100の課題に「〜〜〜」とコメントして
```