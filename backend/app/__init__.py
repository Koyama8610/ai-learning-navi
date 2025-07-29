import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()

# 拡張機能のインスタンスを初期化
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app) # CORSを有効化

    # --- 設定 ---
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")

    # --- 拡張機能の初期化 ---
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    with app.app_context():
        # ★★★ ここのインポート文を修正しました ★★★
        from . import models
        from . import api

        app.register_blueprint(api.api_bp, url_prefix='/api')

    return app
