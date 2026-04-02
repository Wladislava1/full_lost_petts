import hashlib
import hmac
import os
import base64
import json
import time

SECRET_KEY = "supersecretkey"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str, salt: bytes = None) -> str:
    if salt is None:
        salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return base64.urlsafe_b64encode(salt + pwd_hash).decode()

def verify_password(password: str, hashed: str) -> bool:
    try:
        decoded = base64.urlsafe_b64decode(hashed.encode())
        salt, pwd_hash = decoded[:16], decoded[16:]
        new_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
        return hmac.compare_digest(pwd_hash, new_hash)
    except Exception:
        return False

def create_token(data: dict, expires_delta_seconds: int) -> str:
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_delta_seconds
    payload_bytes = json.dumps(payload).encode()
    signature = hmac.new(SECRET_KEY.encode(), payload_bytes, hashlib.sha256).digest()
    token = base64.urlsafe_b64encode(payload_bytes + b"." + signature).decode()
    return token

def create_access_token(data: dict) -> str:
    return create_token(data, ACCESS_TOKEN_EXPIRE_MINUTES * 60)

def create_refresh_token(data: dict) -> str:
    payload = data.copy()
    payload["type"] = "refresh"
    return create_token(payload, REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)

def decode_token(token: str):
    try:
        decoded = base64.urlsafe_b64decode(token.encode())
        payload_bytes, signature = decoded.rsplit(b".", 1)
        expected_sig = hmac.new(SECRET_KEY.encode(), payload_bytes, hashlib.sha256).digest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        payload = json.loads(payload_bytes)
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None