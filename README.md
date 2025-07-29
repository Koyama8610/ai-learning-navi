<div align="center">

# AI学習ナビ 🚀

**AIがあなたの学習をナビゲート。最適な学習プランを自動で提案します。**

</div>

---

## 💡 概要

「AI学習ナビ」は、ユーザーが学びたいテーマ（例：「Python 入門」「React State管理」）を入力するだけで、AI（Google Gemini）がインターネット上から最適な学習リソース（動画、記事、公式ドキュメントなど）を組み合わせて、パーソナライズされた学習プランを提案するWebアプリケーションです。

生成された学習プランは「チケット」として保存し、進捗を管理することができます。

---

## ✨ 主な機能

| 機能 | 説明 |
| :--- | :--- |
| **🤖 AIによる学習プラン生成** | キーワードに基づき、多様なソースから最適な学習コンテンツを5つ提案します。URLの有効性をサーバーサイドで検証し、信頼性の高い情報のみを提供します。 |
| **👤 ユーザー認証** | 安全な新規登録・ログイン機能を実装。認証されたユーザーのみがサービスを利用できます。 |
| **🎫 チケット管理** | AIが生成したプランを「チケット」として保存し、一覧で確認できます。チケットごとに「完了」「未完了」のステータスを管理し、学習の進捗を記録できます。 |

---

## 🛠️ 技術スタック

このプロジェクトは、モダンな技術スタックで構築されています。

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
  <img src="https://img.shields.io/badge/Google_Gemini-8E77D8?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini">
</p>

| カテゴリ | 使用技術 |
| :--- | :--- |
| **フロントエンド** | React.js, Tailwind CSS, React Router, Axios |
| **バックエンド** | Python 3.10, Flask, SQLAlchemy, Flask-JWT-Extended |
| **データベース** | PostgreSQL |
| **AI** | Google Gemini 2.5 Flash |
| **インフラ** | Docker, Docker Compose, Nginx, Gunicorn |

---

## 🚀 セットアップ手順

このアプリケーションをあなたのローカル環境で動かすための手順です。

### 1. 前提条件
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)がインストールされていること。

### 2. インストールと起動
1.  **リポジトリをクローンします。**
    ```bash
    git clone [https://github.com/Koyama8610/ai-learning-navi.git](https://github.com/Koyama8610/ai-learning-navi.git)
    cd ai-learning-navi
    ```

2.  **環境変数ファイルを作成します。**
    `.env.example`をコピーして`.env`ファイルを作成し、ファイル内の指示に従ってあなた自身の`GEMINI_API_KEY`などを設定してください。
    ```bash
    cp .env.example .env
    ```

3.  **Dockerコンテナをビルドして起動します。**
    初回起動には数分かかる場合があります。
    ```bash
    docker compose up --build -d
    ```

4.  **データベースを初期化します。**
    以下のコマンドを実行して、データベースにテーブルを作成します。
    ```bash
    docker compose run --rm backend flask db upgrade
    ```

5.  **アプリケーションにアクセスします。**
    ブラウザで `http://localhost` を開いてください。

### 使い方
1.  右上**「新規登録」**からアカウントを作成します。
2.  作成したアカウントで**「ログイン」**します。
3.  学習したいテーマを入力し、**「生成」**ボタンをクリックします。
4.  AIが生成したプランが表示されたら、**「このプランをチケットとして保存」**ボタンで保存できます。
5.  ヘッダーの**「マイチケット」**から、保存したプランの一覧を確認し、進捗を管理できます。
