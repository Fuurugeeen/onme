"""Mock Gemini service for development without API keys."""

import random


class MockGeminiService:
    """Mock service that returns predefined responses for testing."""

    ONBOARDING_RESPONSES = [
        "こんにちは！AIコーチのアシスタントだよ。今日から一緒に自分のことを探っていこう！まずは簡単な質問から始めるね。最近、どんなことに興味がある？",
        "なるほど！いい感じだね。じゃあ次の質問。普段、何かを決めるとき、じっくり考えるタイプ？それともパッと直感で決めるタイプ？",
        "ありがとう！だんだん君のことがわかってきたよ。ストレスを感じたとき、どうやって発散してる？例えば、音楽を聴く、散歩する、友達と話すとか。",
        "いいね！自分なりのリラックス方法を持ってるのは大事だよ。最後に、将来やってみたいこと、興味があることってある？大きなことじゃなくても全然OK！",
        "たくさん教えてくれてありがとう！君のことがよくわかったよ。これからは毎日少しずつ、自分を知る時間を作っていこう。明日から「デイリーコーチ」が始まるよ！",
    ]

    DAILY_RESPONSES = [
        "おはよう！今日の調子はどう？1（疲れてる）〜5（元気いっぱい）で教えて！",
        "なるほどね。無理しないでいこう。今日のタスクは「{task}」だよ。これなら5分で終わるから、気軽にやってみて！",
        "いい感じ！昨日のタスクはどうだった？できたかな？",
        "完璧じゃなくてもOK！やろうとした気持ちが大事だよ。今日も自分のペースでいこう。",
        "今日も話してくれてありがとう！また明日ね。",
    ]

    TASK_TEMPLATES = {
        "study": [
            "英単語を5個だけ眺める",
            "本を1ページだけ読む",
            "ニュース記事を1つ読む",
            "興味あるYouTube動画を1本見る（学習系）",
            "新しい言葉を1つ調べる",
        ],
        "lifestyle": [
            "机の上を1分だけ片付ける",
            "水を1杯飲む",
            "窓を開けて深呼吸3回",
            "明日の準備を1つだけする",
            "いらないものを1つ捨てる",
        ],
        "exercise": [
            "ストレッチを30秒だけする",
            "その場で足踏み20回",
            "背伸びを3回する",
            "階段を使う（1回だけ）",
            "首を回す運動をする",
        ],
        "self_exploration": [
            "今日の気分を一言で書く",
            "好きなものを3つ思い浮かべる",
            "今日あった小さな良いことを1つ見つける",
            "自分の長所を1つ考える",
            "やってみたいことを1つ書く",
        ],
    }

    def __init__(self):
        self._onboarding_index = 0
        self._daily_index = 0

    async def generate_onboarding_response(
        self,
        conversation_history: list[dict],
        user_profile: dict,
    ) -> str:
        """Generate mock response for onboarding conversation."""
        # Simple progression through responses
        response = self.ONBOARDING_RESPONSES[
            min(self._onboarding_index, len(self.ONBOARDING_RESPONSES) - 1)
        ]
        self._onboarding_index += 1

        # Check if onboarding should complete
        if len(conversation_history) >= 8:
            return response + "\n\n[ONBOARDING_COMPLETE]"

        return response

    async def generate_daily_coach_response(
        self,
        conversation_history: list[dict],
        user_profile: dict,
        today_task: dict | None,
    ) -> str:
        """Generate mock response for daily coaching conversation."""
        task_content = (
            today_task.get("content", "今日のタスク") if today_task else "今日のタスク"
        )

        response = self.DAILY_RESPONSES[
            min(self._daily_index, len(self.DAILY_RESPONSES) - 1)
        ]
        self._daily_index += 1

        return response.format(task=task_content)

    async def analyze_conversation(
        self,
        conversation_history: list[dict],
    ) -> dict:
        """Return mock analysis results."""
        return {
            "thinking_style": {
                "logical_intuitive": random.uniform(0.3, 0.7),
                "decisive_deliberate": random.uniform(0.3, 0.7),
                "optimistic_cautious": random.uniform(0.3, 0.7),
            },
            "motivation_drivers": {
                "achievement": random.uniform(0.4, 0.8),
                "recognition": random.uniform(0.2, 0.6),
                "growth": random.uniform(0.5, 0.9),
                "stability": random.uniform(0.3, 0.7),
            },
            "values": ["成長", "自由", "誠実さ"],
            "strengths_discovered": ["粘り強さ", "好奇心"],
            "insight": "新しいことに挑戦する意欲がある",
        }

    async def generate_task(
        self,
        user_profile: dict,
        category: str,
    ) -> str:
        """Generate mock daily task."""
        tasks = self.TASK_TEMPLATES.get(category, self.TASK_TEMPLATES["lifestyle"])
        return random.choice(tasks)

    async def evaluate_conversation_depth(
        self,
        conversation_history: list[dict],
    ) -> dict:
        """Return mock evaluation results."""
        return {
            "self_disclosure": random.uniform(0.4, 0.8),
            "specificity": random.uniform(0.3, 0.7),
            "insight_expression": random.uniform(0.3, 0.6),
        }
