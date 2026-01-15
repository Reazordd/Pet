import os
import logging
from pathlib import Path
from datetime import timedelta

# Безопасное чтение .env с явной кодировкой UTF-8
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Загружаем .env только если он существует, в UTF-8
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path, encoding="utf-8")

def env(key, default=None):
    return os.environ.get(key, default)

# Основные настройки
SECRET_KEY = env("SECRET_KEY", "django-insecure-dev-key-for-local-use-only")
DEBUG = str(env("DEBUG", "True")).lower() in ("1", "true", "yes")

ALLOWED_HOSTS = [h.strip() for h in env("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]

# Sentry (опционально)
SENTRY_DSN = env("SENTRY_DSN", "").strip()
SENTRY_ENV = env("SENTRY_ENV", "development")
SENTRY_TRACES_SAMPLE_RATE = float(env("SENTRY_TRACES_SAMPLE_RATE", "0.0"))
SENTRY_PROFILES_SAMPLE_RATE = float(env("SENTRY_PROFILES_SAMPLE_RATE", "0.0"))

if SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration

        sentry_logging = LoggingIntegration(level=logging.INFO, event_level=logging.ERROR)
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            integrations=[DjangoIntegration(), sentry_logging],
            traces_sample_rate=SENTRY_TRACES_SAMPLE_RATE,
            profiles_sample_rate=SENTRY_PROFILES_SAMPLE_RATE,
            environment=SENTRY_ENV,
            send_default_pii=True,
        )
        print(f"[SENTRY] Enabled (env={SENTRY_ENV})")
    except Exception as e:
        print("[SENTRY] init failed or sentry_sdk not installed:", e)
else:
    print("[SENTRY] disabled (no DSN)")

# Приложения
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    # Local apps
    'users',
    'ads',
    'chat',
    'forum',
    'notifications',
    'history',
    'reviews',
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "pet_project.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "pet_project.wsgi.application"

# База данных — совместимость с Timeweb Cloud
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME", env("POSTGRES_DB", "petdb")),
        "USER": env("DB_USER", env("POSTGRES_USER", "petuser")),
        "PASSWORD": env("DB_PASSWORD", env("POSTGRES_PASSWORD", "5v1234567")),
        "HOST": env("DB_HOST", env("POSTGRES_HOST", "localhost")),
        "PORT": env("DB_PORT", env("POSTGRES_PORT", "5432")),
    }
}

AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = env("LANGUAGE_CODE", "ru-RU")
TIME_ZONE = env("TIME_ZONE", "Europe/Bucharest")
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=int(env("JWT_ACCESS_HOURS", "1"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(env("JWT_REFRESH_DAYS", "7"))),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Proxy & HTTPS headers (актуально при использовании nginx/облака)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CORS & CSRF
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in env("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()
]
CORS_ALLOW_CREDENTIALS = False

CSRF_TRUSTED_ORIGINS = [
    origin.strip() for origin in env("CSRF_TRUSTED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()
]
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"

# 🔥 Настройки почты (Яндекс)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.yandex.ru"
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = env("EMAIL_HOST_USER", "reazordd@yandex.ru")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", "bpelzaibnborpvxa")  # ← пароль приложения
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
FRONTEND_URL = env("FRONTEND_URL", "http://localhost:3000")

# 🔒 Безопасность только в production
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = "DENY"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Логирование
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[%(asctime)s] %(levelname)s %(name)s: %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose"
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}