"""
AI analysis for prediction cards.

Uses the OpenAI-compatible GapGPT API. The key lives only on the server, so it is
never shipped to the browser. If the `openai` package is installed its client is
used (same code as the docs); otherwise the identical HTTP request is sent with
`requests`, so nothing extra has to be installed.
"""
import logging

import requests

logger = logging.getLogger(__name__)

AI_API_KEY = "sk-WX2i46CFdDmpupNZuHj4TTHWn8q7F6ddNXDjbaQNPUyjGaYF"
AI_BASE_URL = "https://api.gapgpt.app/v1"
AI_MODEL = "gpt-4"
AI_TIMEOUT = 25  # seconds (keep below the 30s gunicorn worker timeout)

PROMPT_PREFIX = (
    "You are an analyst for an on-chain prediction platform. Analyze the prediction below: "
    "explain the key factors, the main risks, and which outcome looks more likely and why. "
    "Keep it under 150 words. Reply in the same language as the prediction text. "
    "Use plain text only (no markdown, no asterisks). This is not betting or financial advice.\n\n"
)


class AIAnalysisError(Exception):
    pass


def build_prompt(match):
    options = f"{match.team1_name} / {match.team2_name}"
    if match.category != 'other':
        options = f"{match.team1_name} / Draw / {match.team2_name}"
    description = (match.description or '').strip() or match.title
    return (
        f"{PROMPT_PREFIX}"
        f"Title: {match.title}\n"
        f"Options: {options}\n"
        f"Description: {description}"
    )


def _extract_text(data):
    """Pull the text out of a Responses-API (or chat-completions) JSON payload."""
    if isinstance(data.get('output_text'), str) and data['output_text'].strip():
        return data['output_text']
    parts = []
    for item in data.get('output') or []:
        for block in item.get('content') or []:
            if isinstance(block, dict) and isinstance(block.get('text'), str):
                parts.append(block['text'])
    if parts:
        return ''.join(parts)
    choices = data.get('choices') or []
    if choices:
        return (choices[0].get('message') or {}).get('content') or ''
    return ''


def _call_with_sdk(prompt):
    from openai import OpenAI  # may not be installed

    client = OpenAI(api_key=AI_API_KEY, base_url=AI_BASE_URL, timeout=AI_TIMEOUT, max_retries=0)
    response = client.responses.create(model=AI_MODEL, input=prompt)
    return response.output_text


def _call_with_requests(prompt):
    res = requests.post(
        f"{AI_BASE_URL}/responses",
        headers={"Authorization": f"Bearer {AI_API_KEY}", "Content-Type": "application/json"},
        json={"model": AI_MODEL, "input": prompt},
        timeout=AI_TIMEOUT,
    )
    res.raise_for_status()
    return _extract_text(res.json())


def analyze(prompt):
    try:
        try:
            text = _call_with_sdk(prompt)
        except ImportError:
            text = _call_with_requests(prompt)
    except Exception:
        logger.exception("AI analysis request failed")
        raise AIAnalysisError("The AI service is unavailable right now. Please try again in a moment.")

    text = (text or '').strip()
    if not text:
        raise AIAnalysisError("The AI returned an empty answer. Please try again.")
    return text
