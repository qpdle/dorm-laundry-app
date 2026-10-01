import sys
import requests
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000/api"

def print_step(title: str):
    print("\n" + "=" * 60)
    print(f"--> {title}")
    print("=" * 60)

def main():
    # 0. Проверка доступности API
    print_step("Шаг 0: Проверка healthcheck и подключения к БД")
    res = requests.get(f"{BASE_URL}/db-check")
    assert res.status_code == 200, f"Ошибка db-check: {res.text}"
    print("Ответ /api/db-check:", res.json())

    # 1. Создание пользователя
    print_step("Шаг 1: Создание пользователя (User)")
    user_payload = {
        "full_name": "Алексей Смирнов",
        "room_number": "512-В",
        "telegram_id": "@smirnov_test"
    }
    res = requests.post(f"{BASE_URL}/users/", json=user_payload)
    if res.status_code == 409:
        # Если пользователь уже был создан ранее в тестах
        users = requests.get(f"{BASE_URL}/users/").json()
        user = next(u for u in users if u["telegram_id"] == "@smirnov_test")
    else:
        assert res.status_code == 201, f"Не удалось создать пользователя: {res.text}"
        user = res.json()
    user_id = user["id"]
    print(f"Пользователь создан/получен успешно! ID={user_id}, ФИО={user['full_name']}")

    # 2. Создание оборудования
    print_step("Шаг 2: Создание оборудования (LaundryMachine)")
    machine_payload = {
        "name": "Тестовая Стиральная Машина LG",
        "machine_type": "washer",
        "floor": 5,
        "status": "available"
    }
    res = requests.post(f"{BASE_URL}/machines/", json=machine_payload)
    assert res.status_code == 201, f"Не удалось создать машину: {res.text}"
    machine = res.json()
    machine_id = machine["id"]
    print(f"Машина создана успешно! ID={machine_id}, Название={machine['name']}")

    # 3. Создание бронирования со связями
    print_step("Шаг 3: Создание связанного бронирования (Booking)")
    start_time = (datetime.utcnow() + timedelta(days=1)).replace(minute=0, second=0, microsecond=0)
    end_time = start_time + timedelta(hours=2)

    booking_payload = {
        "user_id": user_id,
        "machine_id": machine_id,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "status": "active"
    }
    res = requests.post(f"{BASE_URL}/bookings/", json=booking_payload)
    assert res.status_code == 201, f"Не удалось создать бронь: {res.text}"
    booking = res.json()
    booking_id = booking["id"]
    print(f"Бронирование создано успешно! ID={booking_id}")
    print(f"Привязка: user_id={booking['user_id']} -> machine_id={booking['machine_id']}")

    # 4. Проверка чтения связанной сущности
    print_step("Шаг 4: Проверка чтения бронирования по ID")
    res = requests.get(f"{BASE_URL}/bookings/{booking_id}")
    assert res.status_code == 200, f"Ошибка чтения брони: {res.text}"
    print("Данные бронирования:", res.json())

    # 5. Проверка каскадного удаления
    print_step("Шаг 5: Проверка каскадного удаления связанной записи")
    # Удаляем стиральную машину
    res = requests.delete(f"{BASE_URL}/machines/{machine_id}")
    assert res.status_code == 204, f"Ошибка удаления машины: {res.text}"
    print(f"Машина ID={machine_id} успешно удалена.")

    # Проверяем, что связанное с ней бронирование удалилось каскадно
    res = requests.get(f"{BASE_URL}/bookings/{booking_id}")
    assert res.status_code == 404, f"Ожидался статус 404, но получен {res.status_code}"
    print(f"Каскадное удаление подтверждено: бронь ID={booking_id} больше не существует (404 Not Found).")

    # Чистим тестового пользователя
    requests.delete(f"{BASE_URL}/users/{user_id}")
    print(f"Тестовый пользователь ID={user_id} удалён.")

    print("Все проверки успешно пройдены. Связи и БД работают корректно.")

if __name__ == "__main__":
    main()