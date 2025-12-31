# 開発体験改善 実装計画

## 概要
フロントエンド・バックエンド両方の開発体験を向上させる4つの改善を実装する。

## 実装する改善

### 1. Prettier + husky + lint-staged (フロントエンド)
**目的**: コードフォーマットの自動化とコミット前チェック

**手順**:
1. パッケージインストール: `prettier`, `eslint-config-prettier`, `husky`, `lint-staged`
2. `.prettierrc` 作成（semi: false, singleQuote: true）
3. ESLint設定に `prettier` を extends に追加（競合回避）
4. `npx husky init` で husky 初期化
5. `.lintstagedrc.json` 作成
6. pre-commit フック設定
7. package.json に `format`, `format:check` scripts 追加

**変更ファイル**:
- `frontend/package.json`
- `frontend/.prettierrc` (新規)
- `frontend/.prettierignore` (新規)
- `frontend/.eslintrc.cjs` (新規)
- `frontend/.lintstagedrc.json` (新規)
- `frontend/.husky/pre-commit` (新規)

---

### 2. Vitest + React Testing Library (フロントエンド)
**目的**: Vite に最適化されたテスト環境を構築

**手順**:
1. パッケージインストール: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@vitest/coverage-v8`
2. `vite.config.ts` に test 設定追加
3. `src/test/setup.ts` 作成（jest-dom セットアップ）
4. `tsconfig.json` に vitest/globals 型追加
5. サンプルテスト作成（Button.test.tsx）
6. package.json に `test`, `test:run`, `test:coverage` scripts 追加

**変更ファイル**:
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/src/test/setup.ts` (新規)
- `frontend/src/components/ui/Button.test.tsx` (新規)

---

### 3. OpenAPI → TypeScript 型自動生成
**目的**: API 通信の型安全性を向上

**ツール**: `openapi-typescript`（軽量、型のみ生成）

**手順**:
1. パッケージインストール: `openapi-typescript`
2. `scripts/generate-types.sh` 作成
3. package.json に `generate:types` script 追加
4. `.gitignore` に `src/types/openapi.json` 追加
5. 既存の手動型から段階的に移行

**変更ファイル**:
- `frontend/package.json`
- `frontend/scripts/generate-types.sh` (新規)
- `frontend/.gitignore`
- `frontend/src/types/api.generated.ts` (生成)

---

### 4. ruff (バックエンド)
**目的**: Python の高速 linter/formatter 導入

**手順**:
1. `requirements.txt` に `ruff>=0.4.0` 追加
2. `pyproject.toml` 作成（ruff + pytest 設定）
3. Makefile に `lint`, `lint-fix`, `format` コマンド追加

**変更ファイル**:
- `backend/requirements.txt`
- `backend/pyproject.toml` (新規)
- `Makefile`

---

## CI 更新
`.github/workflows/ci.yml` に以下を追加:
- フロントエンド: `format:check`, `test:run`
- バックエンド: `ruff check`, `ruff format --check`

---

## 実装順序
1. **ruff** - 独立しており即座に導入可能
2. **Prettier + ESLint** - フォーマッター基盤
3. **husky + lint-staged** - コミットフック
4. **Vitest** - テスト環境
5. **OpenAPI 型生成** - API 安定後に段階移行
6. **CI 統合** - 全体の確認

---

## 注意点
- Prettier 初回実行で大量のファイル変更が発生する
- ruff の初回実行で多数の警告が出る可能性（`--fix` で自動修正推奨）
- OpenAPI 型生成はバックエンドサーバー起動が必要
