# UI リデザイン TODO

## 概要
UI設計 v2 に基づく実装タスク一覧

---

## 1. 新規コンポーネント作成

### UI コンポーネント
- [ ] `components/ui/ProgressBar.tsx` - プログレスバー

### Home コンポーネント
- [ ] `components/home/GoalCard.tsx` - 目標表示カード（目標名、進捗%、残り日数）
- [ ] `components/home/StreakBadge.tsx` - 継続日数バッジ
- [ ] `components/home/CoachingCTA.tsx` - 「話す」ボタンエリア（今日のプロンプト表示）
- [ ] `components/home/InsightsList.tsx` - 気づき一覧

### Goal コンポーネント
- [ ] `components/goal/GoalForm.tsx` - 目標入力フォーム（目標、期限、理由）

### Layout コンポーネント
- [ ] `components/layouts/ChatLayout.tsx` - チャット専用レイアウト（ヘッダー + 戻るボタン）

---

## 2. 新規ページ作成

- [ ] `pages/GoalSetupPage.tsx` - 目標設定画面
- [ ] `pages/HomePage.tsx` - ダッシュボード（メイン画面）
- [ ] `pages/ChatPage.tsx` - AIコーチング対話（フルスクリーン）
- [ ] `pages/SettingsPage.tsx` - 設定・履歴・アカウント

---

## 3. 既存ファイル変更

### レイアウト変更
- [ ] `components/layouts/AppLayout.tsx` - 3タブ → 2タブに変更（ホーム / 設定）

### ルーティング変更
- [ ] `App.tsx` - 新しいルーティング構成に更新
  - `/goal-setup` 追加
  - `/` を HomePage に変更
  - `/chat` 追加
  - `/settings` 追加
  - `/daily`, `/progress`, `/profile` 削除

---

## 4. 旧ファイル削除

- [ ] `pages/DailyCoachPage.tsx` - HomePage + ChatPage に分割済み
- [ ] `pages/ProgressPage.tsx` - HomePage に統合済み
- [ ] `pages/ProfilePage.tsx` - SettingsPage に統合済み

---

## 5. API / ストア調整

### 新規 API（必要に応じて）
- [ ] 目標の CRUD API（`api/goals.ts`）
- [ ] 気づき一覧取得 API

### ストア調整
- [ ] 目標状態管理（`stores/goal.ts`）

---

## 6. 画面遷移ロジック

- [ ] オンボーディング完了後 → GoalSetupPage へ遷移
- [ ] GoalSetup 完了後 → HomePage へ遷移
- [ ] GoalSetup 「後で設定する」 → HomePage へ遷移
- [ ] Home 「話す」ボタン → ChatPage へ遷移
- [ ] Chat 「戻る」ボタン → HomePage へ遷移

---

## 7. テスト・確認

- [ ] 新規ユーザーフロー確認（Login → Onboarding → GoalSetup → Home）
- [ ] 既存ユーザーフロー確認（Login → Home）
- [ ] チャット機能の動作確認
- [ ] 設定画面の各機能確認
- [ ] レスポンシブ対応確認

---

## 優先度順の実装推奨

### Phase 1: 基盤
1. AppLayout を2タブに変更
2. HomePage 作成（シンプル版）
3. SettingsPage 作成
4. ルーティング更新

### Phase 2: チャット分離
5. ChatPage 作成
6. ChatLayout 作成
7. Home → Chat 遷移実装

### Phase 3: 目標機能
8. GoalSetupPage 作成
9. GoalForm 作成
10. 目標関連 API / ストア

### Phase 4: ダッシュボード強化
11. GoalCard, StreakBadge, CoachingCTA, InsightsList 作成
12. HomePage を完成版に更新

### Phase 5: クリーンアップ
13. 旧ページ削除
14. 不要コード削除
15. テスト・動作確認
