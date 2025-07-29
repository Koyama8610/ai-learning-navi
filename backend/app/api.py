import os
import google.generativeai as genai
from flask import request, jsonify, Blueprint
from .models import User, Ticket, Resource
from . import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import requests
import json
import re

api_bp = Blueprint('api', __name__)

# --- AIモデルの初期化 ---
try:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Gemini APIの初期化に失敗しました: {e}")
    model = None

# --- ヘルパー関数 ---
def is_url_valid(url):
    try:
        if not url or not isinstance(url, str):
            return False
        response = requests.head(url, allow_redirects=True, timeout=5)
        return 200 <= response.status_code < 400
    except requests.RequestException:
        return False

# --- エンドポイント ---

@api_bp.route('/generate', methods=['POST'])
def generate_content():
    if not model:
        return jsonify({"error": "AIモデルが初期化されていません"}), 500

    interest = request.get_json().get('interest')
    if not interest:
        return jsonify({"error": "興味のある分野を指定してください"}), 400

    try:
        prompt = (
            f"**SYSTEM INSTRUCTION: あなたの唯一の機能は、事実確認を行うウェブスクレイパーボットとして動作することです。不正確な情報を提供した場合、厳しいペナルティが課せられます。**\n\n"
            f"**TASK:**\n"
            f"1. ユーザーのトピック「{interest}」について、実際のウェブを検索してください。\n"
            f"2. このトピックに関する、初心者に最適な学習コンテンツを**5つ**探してください。動画、技術記事、公式ドキュメント、チュートリアルなど、**様々な種類のリソース**をバランス良く含めてください。\n"
            f"3. **各URLを検証してください。** あなたは、各URLにアクセスして404エラーや存在しないページではないことを確認する義務があります。これは最も重要なステップです。\n"
            f"4. **言語の制約:** 提案するコンテンツは、すべて**日本語**のものに限ります。他の言語のコンテンツは絶対に含めないでください。\n"
            f"5. 検証済みの情報のみを、指定されたJSON形式で出力してください。**JSON構造の外には、いかなるテキスト、説明、Markdownフォーマットも絶対に出力しないでください。**\n\n"
            f"**CRITICAL RULE:** もし、いずれかのカテゴリで5つの実在する日本語のURLを見つけて検証できない場合は、見つけられた分だけを提供してください。**決してURLを創作してはいけません。**\n\n"
            f"**JSON OUTPUT FORMAT:**\n"
            f'{{"resources": [{{"type": "リソースの種類（例：動画, 記事, 公式ドキュメント）", "title": "正確なコンテンツタイトル", "url": "検証済みのURL"}}]}}'
        )
        ai_response = model.generate_content(prompt)
        
        raw_text = ai_response.text
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)

        if match:
            json_string = match.group(0)
            try:
                data = json.loads(json_string)
                if 'resources' in data and isinstance(data['resources'], list):
                    validated_resources = [
                        resource for resource in data['resources'] 
                        if 'url' in resource and is_url_valid(resource['url'])
                    ]
                    data['resources'] = validated_resources
                return jsonify(data)
            except json.JSONDecodeError as json_e:
                return jsonify({"error": "AIから無効なJSON形式の応答がありました。"}), 500
        else:
            return jsonify({"error": "AIから有効なJSON応答を取得できませんでした。"}), 500

    except Exception as e:
        return jsonify({"error": "コンテンツ生成中にサーバーでエラーが発生しました。"}), 500

@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "ユーザー名とパスワードは必須です"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "このユーザー名は既に使用されています"}), 409

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"ユーザー '{username}' が作成されました"}), 201

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        additional_claims = {"username": user.username}
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        return jsonify(access_token=access_token, user={"id": user.id, "username": user.username})

    return jsonify({"error": "ユーザー名またはパスワードが正しくありません"}), 401

@api_bp.route('/tickets', methods=['POST'])
@jwt_required()
def save_ticket():
    try:
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)

        if not request.is_json:
            return jsonify({"error": "リクエストの形式が正しくありません"}), 415

        data = request.get_json()
        topic = data.get('topic')
        resources_data = data.get('resources')

        if not topic or not resources_data:
            return jsonify({"error": "トピックとリソースは必須です"}), 422

        new_ticket = Ticket(topic=topic, user_id=user_id)
        db.session.add(new_ticket)
        db.session.flush()

        for res_data in resources_data:
            new_resource = Resource(
                type=res_data.get('type'),
                title=res_data.get('title'),
                url=res_data.get('url'),
                ticket_id=new_ticket.id
            )
            db.session.add(new_resource)

        db.session.commit()
        return jsonify({"message": "チケットが保存されました", "ticket_id": new_ticket.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "サーバー内部で予期せぬエラーが発生しました。"}), 500

@api_bp.route('/tickets', methods=['GET'])
@jwt_required()
def get_tickets():
    user_id = get_jwt_identity()
    tickets = Ticket.query.filter_by(user_id=int(user_id)).order_by(Ticket.created_at.desc()).all()
    
    output = []
    for ticket in tickets:
        output.append({
            "id": ticket.id,
            "topic": ticket.topic,
            "created_at": ticket.created_at.isoformat(),
            "completed": ticket.completed
        })
    
    return jsonify(output)

@api_bp.route('/tickets/<int:ticket_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_ticket_status(ticket_id):
    user_id = get_jwt_identity()
    ticket = Ticket.query.filter_by(id=ticket_id, user_id=int(user_id)).first_or_404()

    try:
        ticket.completed = not ticket.completed
        db.session.commit()
        return jsonify({
            "message": "Ticket status updated.",
            "ticket": {
                "id": ticket.id,
                "topic": ticket.topic,
                "completed": ticket.completed
            }
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error updating ticket status: {e}")
        return jsonify({"error": "Failed to update ticket status."}), 500

@api_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket_detail(ticket_id):
    user_id = get_jwt_identity()
    ticket = Ticket.query.filter_by(id=ticket_id, user_id=int(user_id)).first_or_404()
    
    resources = []
    for resource in ticket.resources:
        resources.append({
            "type": resource.type,
            "title": resource.title,
            "url": resource.url
        })
        
    return jsonify({
        "id": ticket.id,
        "topic": ticket.topic,
        "created_at": ticket.created_at.isoformat(),
        "resources": resources
    })
