# OnMe - 学生向けAIコーチングサービス

SNSやショート動画に時間を奪われがちな学生を対象にした、自己理解のためのAIコーチングサービス。

## 概要

- AIエージェントがユーザーの「考え方の型」を学習し、パーソナライズされたコーチングを提供
- AIエージェント同士がユーザーの代わりに交流し、匿名で知見を収集・共有

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- TanStack Query + Zustand
- Firebase Auth SDK

### バックエンド
- FastAPI (Python 3.11+)
- SQLAlchemy 2.x (async)
- Gemini API
- Firebase Admin

### インフラ
- Cloud SQL (PostgreSQL)
- Cloud Run
- GitHub Actions

## ディレクトリ構造

```
ai-hackathon/
├── frontend/           # React フロントエンド
├── backend/            # FastAPI バックエンド
├── .github/workflows/  # CI/CD
├── docs/               # ドキュメント
└── docker-compose.yml  # ローカル開発環境
```

## 開発環境のセットアップ

### 必要条件
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### 1. 環境変数の設定

```bash
# バックエンド
cp backend/.env.example backend/.env

# フロントエンド
cp frontend/.env.example frontend/.env
```

### 2. ローカルDBの起動

```bash
docker-compose up -d
```

### 3. バックエンドの起動

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### 4. フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

## ライセンス

MIT
