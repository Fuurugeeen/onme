import json

import google.generativeai as genai

from app.core.config import settings


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def generate_onboarding_response(
        self,
        conversation_history: list[dict],
        user_profile: dict,
    ) -> str:
        """Generate response for onboarding conversation."""
        system_prompt = """あなたは学生向けのAIコーチです。
フラットで親しみやすい友達のような口調で話してください。

オンボーディングの目的:
- ユーザーの価値観、興味、ストレス耐性を理解する
- 10-15分で完了できる自然な会話を行う
- 質問は選択式と短文を組み合わせる

重要なルール:
- 他人との比較は絶対にしない
- 評価や判断をしない
- 押し付けがましくならない
- 相手のペースに合わせる

現在のユーザープロファイル:
""" + json.dumps(user_profile, ensure_ascii=False, indent=2)

        messages = self._format_messages(conversation_history, system_prompt)
        response = await self._generate(messages)
        return response

    async def generate_daily_coach_response(
        self,
        conversation_history: list[dict],
        user_profile: dict,
        today_task: dict | None,
    ) -> str:
        """Generate response for daily coaching conversation."""
        system_prompt = f"""あなたは学生向けのAIコーチです。
フラットで親しみやすい友達のような口調で話してください。

デイリーコーチの目的:
- 今日の状態確認（気分・余裕度）
- 昨日の行動の簡単な振り返り
- 今日やる「1タスク」の確認

重要なルール:
- 1日5分以内で完結する会話を目指す
- タスクは「失敗しにくい粒度」に分解されている
- 未実行でも責めない
- 「できなかった理由」を分析材料として使う

ユーザープロファイル:
{json.dumps(user_profile, ensure_ascii=False, indent=2)}

今日のタスク:
{json.dumps(today_task, ensure_ascii=False, indent=2) if today_task else "未設定"}
"""

        messages = self._format_messages(conversation_history, system_prompt)
        response = await self._generate(messages)
        return response

    async def analyze_conversation(
        self,
        conversation_history: list[dict],
    ) -> dict:
        """Analyze conversation to extract user characteristics."""
        prompt = """以下の会話から、ユーザーの特徴を抽出してJSON形式で返してください:

分析項目:
- thinking_style: 思考スタイル
  - logical_intuitive: 0.0(直感的)〜1.0(論理的)
  - decisive_deliberate: 0.0(即決型)〜1.0(熟考型)
  - optimistic_cautious: 0.0(楽観的)〜1.0(慎重派)
- motivation_drivers: モチベーション源
  - achievement: 達成感 (0.0〜1.0)
  - recognition: 承認 (0.0〜1.0)
  - growth: 成長 (0.0〜1.0)
  - stability: 安定 (0.0〜1.0)
- values: 表出された価値観キーワード (配列)
- strengths_discovered: 発見された強み (配列)
- insight: この会話から得られた洞察 (文字列)

会話:
""" + json.dumps(conversation_history, ensure_ascii=False)

        try:
            response = self.model.generate_content(prompt)
            # Parse JSON from response
            text = response.text
            # Extract JSON from code block if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception as e:
            print(f"Analysis error: {e}")
            return {}

    async def generate_task(
        self,
        user_profile: dict,
        category: str,
    ) -> str:
        """Generate a personalized daily task."""
        prompt = f"""以下のユーザープロファイルに基づいて、今日のタスクを1つ生成してください。

ユーザープロファイル:
{json.dumps(user_profile, ensure_ascii=False, indent=2)}

カテゴリ: {category}

ルール:
- 必ず失敗しにくい粒度に分解する
- 「英語を30分」ではなく「英単語10個を見る」のように具体的に
- 5分以内で完了できるタスク
- ユーザーの特性に合わせてカスタマイズ

タスク内容のみを返してください（説明不要）:"""

        response = self.model.generate_content(prompt)
        return response.text.strip()

    async def evaluate_conversation_depth(
        self,
        conversation_history: list[dict],
    ) -> dict:
        """Evaluate conversation depth for effect measurement."""
        prompt = """以下の会話を分析し、3つの観点でスコアを返してください（JSON形式）:

1. self_disclosure (0.0〜1.0): 自己開示度
   - 個人的な感情、経験、悩みをどれだけ話したか

2. specificity (0.0〜1.0): 具体性
   - 抽象的な話から具体的なエピソードに深まったか

3. insight_expression (0.0〜1.0): 気づきの表明
   - 「分かった」「気づいた」「そうかも」などの発言があるか

会話:
""" + json.dumps(conversation_history, ensure_ascii=False)

        try:
            response = self.model.generate_content(prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception as e:
            print(f"Evaluation error: {e}")
            return {
                "self_disclosure": 0.5,
                "specificity": 0.5,
                "insight_expression": 0.5,
            }

    def _format_messages(
        self,
        conversation_history: list[dict],
        system_prompt: str,
    ) -> str:
        """Format messages for Gemini."""
        formatted = f"システム: {system_prompt}\n\n"
        for msg in conversation_history:
            role = "ユーザー" if msg["role"] == "user" else "アシスタント"
            formatted += f"{role}: {msg['content']}\n"
        formatted += "アシスタント: "
        return formatted

    async def _generate(self, prompt: str) -> str:
        """Generate response from Gemini."""
        response = self.model.generate_content(prompt)
        return response.text
