import requests

# Получаем токены
url = 'http://127.0.0.1:8000/api/token/'
data = {
    'username': 'Vasia',
    'password': '5v1234567'
}
response = requests.post(url, json=data)
tokens = response.json()

# Используем access token для запросов
headers = {
    'Authorization': f'Bearer {tokens["access"]}'
}

# Пример запроса к защищенному эндпоинту
response = requests.get('http://127.0.0.1:8000/api/pets/', headers=headers)
print(response.json())



