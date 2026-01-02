# Lint

バックエンドのlintチェックとフォーマットを実行します。

## 実行方法

`backend` ディレクトリで以下のコマンドを実行:

```bash
docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install -q ruff && ruff check . && ruff format --check ."
```

## 自動修正

```bash
docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install -q ruff && ruff check --fix . && ruff format ."
```

## チェック内容

- `ruff check`: Lintエラーの検出
- `ruff format --check`: フォーマットの確認

## 設定ファイル

`backend/pyproject.toml` で設定を管理:

```toml
[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "C4"]
ignore = ["E501", "B008"]
```
