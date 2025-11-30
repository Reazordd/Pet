import os

# --- НАСТРОЙКИ ---
# Папки, которые НЕ нужны (мусор)
IGNORE_DIRS = {
    'node_modules', 'venv', '.venv', 'env', '.git', '__pycache__',
    'build', 'dist', 'migrations', '.idea', '.vscode', '.pytest_cache'
}
# Расширения файлов, которые НЕ нужны (бинарники, картинки, шрифты)
IGNORE_EXTENSIONS = {
    '.pyc', '.sqlite3', '.db',
    '.png', '.jpg', '.jpeg', '.svg', '.ico', '.gif',
    '.woff', '.woff2', '.ttf', '.eot',
    '.lock', '.pdf', '.zip', '.tar', '.gz'
}
# Конкретные файлы, которые не нужны
IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', 'poetry.lock',
    'pack_project.py', 'db.sqlite3'
}
# Выходной файл
OUTPUT_FILE = "project_context.txt"


def collect_project():
    output = []
    total_files = 0

    print(f"Начинаю сборку проекта в файл {OUTPUT_FILE}...")

    # 1. Сначала записываем структуру папок (дерево)
    output.append("========== PROJECT STRUCTURE ==========\n")
    for root, dirs, files in os.walk("."):
        # Исключаем игнорируемые папки "на лету", чтобы не заходить внутрь
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        level = root.replace(".", "").count(os.sep)
        indent = " |  " * level
        output.append(f"{indent}{os.path.basename(root)}/\n")

        subindent = " |  " * (level + 1)
        for f in files:
            if f not in IGNORE_FILES and not any(f.endswith(ext) for ext in IGNORE_EXTENSIONS):
                output.append(f"{subindent}{f}\n")

    output.append("\n========== FILE CONTENTS ==========\n\n")

    # 2. Теперь читаем содержимое файлов
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            if file in IGNORE_FILES or any(file.endswith(ext) for ext in IGNORE_EXTENSIONS):
                continue

            file_path = os.path.join(root, file)

            # Пробуем прочитать файл
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # Добавляем разделитель и имя файла
                    output.append(f"\n{'=' * 20} START FILE: {file_path} {'=' * 20}\n")
                    output.append(content)
                    output.append(f"\n{'=' * 20} END FILE: {file_path} {'=' * 20}\n")
                    total_files += 1
            except UnicodeDecodeError:
                print(f"SKIP (бинарный/кодировка): {file_path}")
            except Exception as e:
                print(f"ERROR reading {file_path}: {e}")

    # Запись результата
    try:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            f.write("".join(output))
        print(f"\nГотово! Обработано файлов: {total_files}")
        print(f"Файл создан: {os.path.abspath(OUTPUT_FILE)}")
        print("Теперь просто перетащите этот файл в чат.")
    except Exception as e:
        print(f"Ошибка записи итогового файла: {e}")


if __name__ == "__main__":
    collect_project()