"""インメモリレート制限ミドルウェア。

Starterプラン（1インスタンス）を前提としたシンプルな辞書ベース実装。
スケールアウト時はRedisベースに差し替えること。
"""

import time
from collections import defaultdict
from dataclasses import dataclass, field

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


@dataclass
class _RateLimitRule:
    max_requests: int
    window_seconds: int


@dataclass
class _RequestLog:
    timestamps: list[float] = field(default_factory=list)


# エンドポイントごとのレート制限設定
# key: (method, path_template)
RATE_LIMIT_RULES: dict[tuple[str, str], _RateLimitRule] = {
    ("POST", "/payments/checkout"): _RateLimitRule(max_requests=5, window_seconds=60),
    ("POST", "/projects"): _RateLimitRule(max_requests=10, window_seconds=60),
    ("POST", "/projects/{id}/sources"): _RateLimitRule(max_requests=20, window_seconds=60),
}


def _match_route(method: str, path: str) -> _RateLimitRule | None:
    """リクエストパスをルールにマッチさせる。"""
    # 完全一致チェック
    rule = RATE_LIMIT_RULES.get((method, path))
    if rule:
        return rule

    # パスパラメータを含むパターンマッチ
    parts = path.strip("/").split("/")

    # POST /projects/{id}/sources — パス: /projects/<uuid>/sources
    if method == "POST" and len(parts) == 3 and parts[0] == "projects" and parts[2] == "sources":
        return RATE_LIMIT_RULES.get(("POST", "/projects/{id}/sources"))

    return None


class RateLimitMiddleware(BaseHTTPMiddleware):
    """インメモリのスライディングウィンドウ方式レート制限。"""

    def __init__(self, app):
        super().__init__(app)
        # key: (user_id, method, rule_key) -> _RequestLog
        self._logs: dict[str, _RequestLog] = defaultdict(_RequestLog)

    async def dispatch(self, request: Request, call_next):
        rule = _match_route(request.method, request.url.path)
        if rule is None:
            return await call_next(request)

        # ユーザー識別: Authorizationヘッダーのトークンをキーに使う
        # 認証前なのでuser_idは取れない。トークン自体をキーにする。
        # トークンがなければIPアドレスでフォールバック。
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            client_key = auth_header[7:][:32]  # トークン先頭32文字で十分
        else:
            client_key = request.client.host if request.client else "unknown"

        log_key = f"{client_key}:{request.method}:{request.url.path}"
        now = time.monotonic()
        log = self._logs[log_key]

        # ウィンドウ外のタイムスタンプを除去
        cutoff = now - rule.window_seconds
        log.timestamps = [ts for ts in log.timestamps if ts > cutoff]

        if len(log.timestamps) >= rule.max_requests:
            retry_after = int(rule.window_seconds - (now - log.timestamps[0])) + 1
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"},
                headers={"Retry-After": str(retry_after)},
            )

        log.timestamps.append(now)

        # 古いキーの掃除（メモリリーク防止）: 10000件超えたら古いものを削除
        if len(self._logs) > 10000:
            stale_keys = [
                k for k, v in self._logs.items()
                if not v.timestamps or v.timestamps[-1] < now - 300
            ]
            for k in stale_keys:
                del self._logs[k]

        return await call_next(request)
