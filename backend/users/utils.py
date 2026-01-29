# backend/users/utils.py
import hashlib
import hmac
from typing import Dict
from django.contrib.auth.tokens import PasswordResetTokenGenerator

# === Email активация ===
class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return str(user.pk) + str(timestamp) + str(user.email_verified)

account_activation_token = AccountActivationTokenGenerator()