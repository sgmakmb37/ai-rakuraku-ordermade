#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test data generator for E2E testing
Provides various types of test data for different testing scenarios
"""

import uuid
import random
import string
from typing import Dict, List, Any
from datetime import datetime

class TestDataGenerator:
    """Generate various types of test data for testing"""

    @staticmethod
    def customer_support_project() -> Dict[str, Any]:
        """Generate customer support project data"""
        return {
            "name": "カスタマーサポートテスト",
            "model_type": "qwen2.5-1.5b",
            "genre": "customer_support",
            "description": "カスタマーサポート業務特化テスト用プロジェクト"
        }

    @staticmethod
    def technical_docs_project() -> Dict[str, Any]:
        """Generate technical documentation project data"""
        return {
            "name": "技術文書テスト",
            "model_type": "gemma-4-e2b",
            "genre": "technical_writing",
            "description": "技術文書作成支援テスト用プロジェクト"
        }

    @staticmethod
    def chatbot_project() -> Dict[str, Any]:
        """Generate chatbot project data"""
        return {
            "name": "チャットボットテスト",
            "model_type": "qwen2.5-3b",
            "genre": "chatbot",
            "description": "対話型AIチャットボットテスト用プロジェクト"
        }

    @staticmethod
    def writing_assist_project() -> Dict[str, Any]:
        """Generate writing assistance project data"""
        return {
            "name": "文章作成支援テスト",
            "model_type": "gemma-4-e4b",
            "genre": "writing_assist",
            "description": "文章作成支援テスト用プロジェクト"
        }

    @staticmethod
    def customer_support_data() -> List[Dict[str, Any]]:
        """Generate customer support training data"""
        return [
            {
                "type": "text",
                "name": "FAQ",
                "content": """Q: 商品の返品はできますか？
A: はい、商品到着から30日以内であれば返品を承ります。未開封・未使用の状態で、購入時のレシートと一緒にお送りください。

Q: 配送にはどのくらい時間がかかりますか？
A: 通常、ご注文確定から3-5営業日でお届けいたします。お急ぎの場合は、お急ぎ便（追加料金500円）をご利用ください。

Q: 支払い方法は何がありますか？
A: クレジットカード、銀行振込、代金引換、コンビニ決済をご利用いただけます。

Q: 商品に不具合があった場合はどうすればよいですか？
A: 申し訳ございません。すぐにカスタマーサポートまでご連絡ください。無料で交換または修理を承ります。"""
            },
            {
                "type": "text",
                "name": "対応マニュアル",
                "content": """【お客様対応の基本原則】

1. 丁寧な言葉遣いを心がける
   - 敬語を正しく使用する
   - 「申し訳ございません」「ありがとうございます」を適切に使う

2. お客様の立場に立って考える
   - お困りごとに共感を示す
   - 解決策を明確に提示する

3. 迅速な対応
   - 24時間以内の初回回答
   - 解決までのスケジュールを明示

4. 正確な情報提供
   - 不明な点は確認してから回答
   - 推測での回答は避ける

【よくある問い合わせ対応例】
- 返品・交換について
- 配送・納期について
- 商品の使い方について
- 料金・支払いについて"""
            }
        ]

    @staticmethod
    def technical_docs_data() -> List[Dict[str, Any]]:
        """Generate technical documentation training data"""
        return [
            {
                "type": "text",
                "name": "API仕様書",
                "content": """# REST API 仕様書

## 認証
すべてのAPIエンドポイントは認証が必要です。
Authorizationヘッダーに Bearer トークンを設定してください。

```
Authorization: Bearer <your_token>
```

## エンドポイント一覧

### GET /projects
プロジェクト一覧を取得

**レスポンス**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "status": "created|training|completed",
      "created_at": "datetime"
    }
  ]
}
```

### POST /projects
新規プロジェクト作成

**リクエスト**
```json
{
  "name": "string",
  "model_type": "qwen2.5-1.5b|qwen2.5-3b|gemma-4-e2b|gemma-4-e4b",
  "genre": "string",
  "description": "string"
}
```

### POST /projects/{id}/train
トレーニング開始

**レスポンス**
```json
{
  "job_id": "uuid",
  "status": "queued"
}
```"""
            },
            {
                "type": "text",
                "name": "セットアップガイド",
                "content": """# セットアップガイド

## 必要な環境
- Python 3.11以上
- Node.js 18以上
- Docker Desktop
- Git

## インストール手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/example/ai-rakuraku-ordermade.git
cd ai-rakuraku-ordermade
```

### 2. 環境変数の設定
`.env.example`をコピーして`.env`を作成
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3. 依存関係のインストール
```bash
# API
cd apps/api
pip install -r requirements.txt

# Web
cd ../web
npm install
```

### 4. データベースの準備
Supabaseプロジェクトを作成し、接続情報を設定

### 5. 起動
```bash
docker-compose up -d
```"""
            }
        ]

    @staticmethod
    def chatbot_data() -> List[Dict[str, Any]]:
        """Generate chatbot training data"""
        return [
            {
                "type": "text",
                "name": "対話例",
                "content": """ユーザー: こんにちは
AI: こんにちは！本日はお疲れ様です。何かお手伝いできることはありますか？

ユーザー: 今日の天気はどうですか？
AI: 申し訳ございませんが、リアルタイムの天気情報は取得できません。お住まいの地域の天気予報をご確認いただけますでしょうか。

ユーザー: ありがとう
AI: どういたしまして！他にもご質問があれば、いつでもお声がけください。

ユーザー: さようなら
AI: お疲れ様でした！また何かございましたら、お気軽にお声がけください。良い一日をお過ごしください。"""
            }
        ]

    @staticmethod
    def large_text_data(size_kb: int = 100) -> str:
        """Generate large text data for testing limits"""
        # Generate approximately `size_kb` KB of text
        text_length = size_kb * 1024
        words = ["技術", "開発", "システム", "プロジェクト", "データ", "テスト", "実装", "設計", "分析", "改善"]

        content = []
        current_length = 0

        while current_length < text_length:
            sentence = f"{random.choice(words)}について説明します。これは{random.choice(words)}の{random.choice(words)}に関する内容です。"
            content.append(sentence)
            current_length += len(sentence.encode('utf-8'))

        return " ".join(content)

    @staticmethod
    def generate_random_project() -> Dict[str, Any]:
        """Generate random project data"""
        model_types = ["qwen2.5-1.5b", "qwen2.5-3b", "gemma-4-e2b", "gemma-4-e4b"]
        genres = ["customer_support", "technical_writing", "chatbot", "writing_assist"]

        return {
            "name": f"ランダムプロジェクト_{uuid.uuid4().hex[:8]}",
            "model_type": random.choice(model_types),
            "genre": random.choice(genres),
            "description": f"テスト用ランダムプロジェクト - {datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }

    @staticmethod
    def generate_invalid_project() -> Dict[str, Any]:
        """Generate invalid project data for error testing"""
        return {
            "name": "",  # Empty name
            "model_type": "invalid_model",  # Invalid model type
            "genre": "",  # Empty genre
            "description": ""  # Empty description
        }

    @staticmethod
    def generate_file_data(file_type: str = "pdf", size_mb: float = 1.0) -> bytes:
        """Generate mock file data for testing"""
        if file_type == "pdf":
            # Generate mock PDF content
            pdf_header = b"%PDF-1.4\n"
            content_size = int(size_mb * 1024 * 1024) - len(pdf_header)
            mock_content = b"Mock PDF content for testing. " * (content_size // 30)
            return pdf_header + mock_content[:content_size]

        elif file_type == "txt":
            content_size = int(size_mb * 1024 * 1024)
            return ("テスト用テキストファイルの内容です。" * (content_size // 50))[:content_size].encode('utf-8')

        else:
            # Default to text
            return b"Mock file content for testing"

    @staticmethod
    def generate_test_prompts() -> List[Dict[str, str]]:
        """Generate test prompts for model quality testing"""
        return [
            {
                "category": "customer_support",
                "prompt": "商品の返品について教えてください",
                "expected_keywords": ["返品", "30日", "未開封", "レシート"]
            },
            {
                "category": "technical",
                "prompt": "APIの認証方法を説明してください",
                "expected_keywords": ["Bearer", "トークン", "認証", "Authorization"]
            },
            {
                "category": "general",
                "prompt": "こんにちは、今日はどんな一日でしたか？",
                "expected_keywords": ["こんにちは", "お疲れ様", "お手伝い"]
            }
        ]

    @staticmethod
    def generate_stripe_webhook_data(session_id: str, amount: int = 88000) -> Dict[str, Any]:
        """Generate Stripe webhook data for testing"""
        return {
            "id": f"evt_{uuid.uuid4().hex[:24]}",
            "object": "event",
            "api_version": "2020-08-27",
            "created": int(datetime.now().timestamp()),
            "data": {
                "object": {
                    "id": session_id,
                    "object": "checkout.session",
                    "amount_total": amount,
                    "currency": "jpy",
                    "payment_status": "paid",
                    "status": "complete"
                }
            },
            "livemode": False,
            "type": "checkout.session.completed"
        }

    @staticmethod
    def generate_over_limit_sources() -> List[Dict[str, Any]]:
        """Generate data sources that exceed limits for testing"""
        return [
            {
                "type": "text",
                "name": f"大容量テキスト{i}",
                "content": TestDataGenerator.large_text_data(120)  # 120KB each
            }
            for i in range(6)  # 6 sources * 120KB = 720KB (over 500KB limit)
        ]

    @staticmethod
    def generate_minimal_valid_source() -> Dict[str, Any]:
        """Generate minimal valid data source"""
        return {
            "type": "text",
            "name": "最小テスト",
            "content": "これは最小限の有効なテストデータです。" * 10  # About 300 characters
        }