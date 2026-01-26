# backend/users/utils.py
import hashlib
import hmac
from typing import Dict
from django.contrib.auth.tokens import PasswordResetTokenGenerator


# === Telegram OAuth ===
def verify_telegram_auth_data(data: Dict[str, str], bot_token: str) -> bool:
    """Проверяет подлинность данных от Telegram Login Widget."""
    received_hash = data.get('hash')
    if not received_hash:
        return False

    check_data = {k: v for k, v in data.items() if k != 'hash'}
    sorted_items = sorted(check_data.items())
    data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted_items)

    secret_key = hashlib.sha256(bot_token.encode()).digest()
    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed_hash, received_hash)


# === Email активация (не удалять!) ===
class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return str(user.pk) + str(timestamp) + str(user.email_verified)

account_activation_token = AccountActivationTokenGenerator()