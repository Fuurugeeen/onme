# Git Worktree 並列開発ガイド

## 概要

UI リデザインを並列開発するための git worktree 構成

```
依存関係図:

[base-layout] ─────┬──▶ [home-page]
                   │
                   ├──▶ [chat-page]
                   │
                   ├──▶ [settings-page]
                   │
                   └──▶ [goal-setup]
                              │
                              ▼
                        [integration]
```

---

## ブランチ構成

| # | ブランチ名 | 依存 | 並列可否 | 担当タスク |
|---|-----------|------|---------|-----------|
| 0 | `feature/base-layout` | なし | - | 基盤（最初に完了必須） |
| 1 | `feature/home-page` | base-layout | 並列可 | HomePage + コンポーネント |
| 2 | `feature/chat-page` | base-layout | 並列可 | ChatPage + ChatLayout |
| 3 | `feature/settings-page` | base-layout | 並列可 | SettingsPage |
| 4 | `feature/goal-setup` | base-layout | 並列可 | GoalSetup + API/ストア |
| 5 | `feature/integration` | 1-4 完了後 | - | 統合・クリーンアップ |

---

## 各ブランチの詳細タスク

### 0. feature/base-layout（完了）

**担当ファイル:**
- [x] `components/layouts/AppLayout.tsx` - 2タブに変更
- [x] `App.tsx` - ルーティング更新（スタブページで動作確認）

**完了条件:**
- [x] 2タブナビゲーションが動作
- [x] `/`, `/settings`, `/chat`, `/goal-setup` へのルーティングが設定済み
- [x] 各ページはスタブ（仮実装）でOK

**コミット:** `8b1cd78` - feat: 2タブレイアウトとルーティング基盤

---

### 1. feature/home-page

**担当ファイル:**
- [ ] `pages/HomePage.tsx`
- [ ] `components/ui/ProgressBar.tsx`
- [ ] `components/home/GoalCard.tsx`
- [ ] `components/home/StreakBadge.tsx`
- [ ] `components/home/CoachingCTA.tsx`
- [ ] `components/home/InsightsList.tsx`

**完了条件:**
- ダッシュボード表示が完成
- 「話す」ボタンで `/chat` へ遷移

---

### 2. feature/chat-page

**担当ファイル:**
- [ ] `pages/ChatPage.tsx`
- [ ] `components/layouts/ChatLayout.tsx`

**完了条件:**
- フルスクリーンでチャット画面表示
- 「戻る」ボタンで `/` へ遷移
- 既存の ChatMessage, ChatInput を活用

---

### 3. feature/settings-page

**担当ファイル:**
- [ ] `pages/SettingsPage.tsx`

**完了条件:**
- アカウント情報表示
- 目標編集リンク
- 過去の会話一覧
- 気づき一覧リンク
- ログアウト機能

---

### 4. feature/goal-setup

**担当ファイル:**
- [ ] `pages/GoalSetupPage.tsx`
- [ ] `components/goal/GoalForm.tsx`
- [ ] `api/goals.ts`（新規）
- [ ] `stores/goal.ts`（新規）

**完了条件:**
- 目標設定フォーム動作
- オンボーディング後に遷移
- 「後で設定する」で `/` へ遷移

---

### 5. feature/integration（最後）

**担当タスク:**
- [ ] 全ブランチをマージ
- [ ] `pages/DailyCoachPage.tsx` 削除
- [ ] `pages/ProgressPage.tsx` 削除
- [ ] `pages/ProfilePage.tsx` 削除
- [ ] 不要なインポート削除
- [ ] 全画面遷移の動作確認
- [ ] テスト実行

---

## Worktree セットアップ手順

### 1. ベースブランチ作成・完了

```bash
# master から基盤ブランチを作成
git checkout -b feature/base-layout

# 基盤実装を完了してプッシュ
git add .
git commit -m "feat: 2タブレイアウトとルーティング基盤"
git push -u origin feature/base-layout
```

### 2. Worktree 作成（並列開発用）

```bash
# worktree ディレクトリを作成
mkdir -p ../ai-hackathon-worktrees

# 各機能ブランチ用の worktree を作成
git worktree add ../ai-hackathon-worktrees/home-page feature/base-layout -b feature/home-page
git worktree add ../ai-hackathon-worktrees/chat-page feature/base-layout -b feature/chat-page
git worktree add ../ai-hackathon-worktrees/settings-page feature/base-layout -b feature/settings-page
git worktree add ../ai-hackathon-worktrees/goal-setup feature/base-layout -b feature/goal-setup
```

### 3. 各 Worktree で開発

```bash
# 例: home-page の開発
cd ../ai-hackathon-worktrees/home-page
npm install  # 必要に応じて
# ... 開発 ...
git add .
git commit -m "feat: HomePage実装"
git push -u origin feature/home-page
```

### 4. Worktree 一覧確認

```bash
git worktree list
```

### 5. 統合（全機能完了後）

```bash
# メインリポジトリに戻る
cd /Users/furugen/dev/ai-hackathon

# 統合ブランチ作成
git checkout -b feature/integration

# 各ブランチをマージ
git merge feature/home-page
git merge feature/chat-page
git merge feature/settings-page
git merge feature/goal-setup

# コンフリクト解消後、旧ファイル削除
# ...

# master へマージ
git checkout master
git merge feature/integration
```

### 6. Worktree 削除（完了後）

```bash
git worktree remove ../ai-hackathon-worktrees/home-page
git worktree remove ../ai-hackathon-worktrees/chat-page
git worktree remove ../ai-hackathon-worktrees/settings-page
git worktree remove ../ai-hackathon-worktrees/goal-setup
```

---

## ディレクトリ構成（開発中）

```
~/dev/
├── ai-hackathon/                    # メイン（master / base-layout）
│
└── ai-hackathon-worktrees/          # 並列開発用
    ├── home-page/                   # feature/home-page
    ├── chat-page/                   # feature/chat-page
    ├── settings-page/               # feature/settings-page
    └── goal-setup/                  # feature/goal-setup
```

---

## 注意事項

1. **base-layout を必ず最初に完了** - 他のブランチはこれに依存
2. **node_modules は各 worktree で共有されない** - 必要に応じて `npm install`
3. **コンフリクトを最小化** - 各ブランチは担当ファイルのみ編集
4. **.env ファイルは各 worktree にコピー** - gitignore されているため
