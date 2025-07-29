# ベースイメージ
FROM python:3.10-slim

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルをコピー
COPY requirements.txt .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# Gunicornでアプリを実行 (docker-compose.ymlで上書きされるが、デフォルトとして記述)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]