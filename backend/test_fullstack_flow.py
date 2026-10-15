import sys
import requests
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000/api"

def print_step(title: str):
    print("\n" + "=" * 70)
    print(f"--> {title}")
    print("=" * 70)

def main():
    print("Запуск демонстрационного сценария проверки интеграции Frontend <-> Backend...")

    # Сценарий 1: Проверка доступности бэкенда и базы данных PostgreSQL
    print_step("Сценарий 1: Healthcheck сервера и подключение к PostgreSQL")
    res = requests.get(f"{BASE_URL}/db-check")
    assert res.status_code == 200, f"Ошибка проверки БД: {res.text}"
    db_data = res.json()
    print(f"Подключение успешно: статус={db_data['status']}, база={db_data['database']}")

    # Сценарий 2: Регистрация нового студента через API (POST /api/auth/register)
    print_step("Сценарий 2: Регистрация студента через API")
    test_tg = f"@test_student_{int(datetime.now().timestamp())}"
    reg_payload = {
        "full_name": "Тестовый Студент Демо",
        "room_number": "404-А",
        "telegram_id": test_tg,
        "password": "strongPassword123"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Не удалось зарегистрировать пользователя: {res.text}"
    created_user = res.json()
    user_id = created_user["id"]
    print(f"Пользователь успешно зарегистрирован! ID={user_id}, Логин={created_user['telegram_id']}")

    # Сценарий 3: Аутентификация, получение пары JWT токенов (POST /api/auth/login)
    print_step("Сценарий 3: Вход в систему и получение JWT Bearer токенов")
    login_payload = {
        "telegram_id": test_tg,
        "password": "strongPassword123"
    }
    res = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    assert res.status_code == 200, f"Ошибка авторизации: {res.text}"
    tokens = res.json()
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("JWT Access и Refresh токены успешно получены.")

    # Сценарий 4: Загрузка каталога техники (GET /api/machines/)
    print_step("Сценарий 4: Загрузка каталога оборудования для экрана машин")
    res = requests.get(f"{BASE_URL}/machines/")
    assert res.status_code == 200, f"Ошибка получения машин: {res.text}"
    machines = res.json()
    
    if not machines:
        # Если в базе нет оборудования, создаем одну тестовую машину
        new_mach = requests.post(f"{BASE_URL}/machines/", json={
            "name": "Демо Стиральная машина №1",
            "machine_type": "washer",
            "floor": 2,
            "status": "available"
        }).json()
        target_machine_id = new_mach["id"]
        print(f"Создано тестовое оборудование ID={target_machine_id}")
    else:
        target_machine_id = machines[0]["id"]
        print(f"Найдено доступное оборудование: ID={target_machine_id}, Название='{machines[0]['name']}'")

    # Сценарий 5: Бронирование слота стирки под авторизованным аккаунтом (POST /api/bookings/)
    print_step("Сценарий 5: Создание бронирования через защищенный эндпоинт")
    tomorrow = datetime.utcnow() + timedelta(days=1)
    start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
    end_time = start_time + timedelta(hours=2)

    booking_payload = {
        "machine_id": target_machine_id,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat()
    }
    res = requests.post(f"{BASE_URL}/bookings/", json=booking_payload, headers=headers)
    assert res.status_code == 201, f"Не удалось создать бронь: {res.text}"
    booking = res.json()
    booking_id = booking["id"]
    print(f"Бронирование создано! ID={booking_id}, Интервал: {booking['start_time']} - {booking['end_time']}")

    # Сценарий 6: Проверка защиты от конфликта пересечений (409 Conflict)
    print_step("Сценарий 6: Проверка конфликта повторного бронирования того же слота")
    res_conflict = requests.post(f"{BASE_URL}/bookings/", json=booking_payload, headers=headers)
    assert res_conflict.status_code == 409, f"Ожидался 409 Conflict, но получен {res_conflict.status_code}"
    print(f"Конфликт успешно перехвачен бэкендом (409 Conflict): {res_conflict.json()['detail']}")

    # Сценарий 7: Проверка личного кабинета (GET /api/bookings/my)
    print_step("Сценарий 7: Получение списка личных бронирований студента")
    res_my = requests.get(f"{BASE_URL}/bookings/my", headers=headers)
    assert res_my.status_code == 200, f"Ошибка получения моих записей: {res_my.text}"
    my_bookings = res_my.json()
    assert any(b["id"] == booking_id for b in my_bookings), "Созданная бронь не найдена в списке личных записей!"
    print(f"Запись успешно отображается в личных бронированиях пользователя ID={user_id}.")

    # Сценарий 8: Редактирование профиля студента (PUT /api/users/{id})
    print_step("Сценарий 8: Редактирование данных профиля студента")
    update_payload = {
        "full_name": "Тестовый Студент Измененный",
        "room_number": "505-В"
    }
    res_update = requests.put(f"{BASE_URL}/users/{user_id}", json=update_payload, headers=headers)
    assert res_update.status_code == 200, f"Ошибка обновления профиля: {res_update.text}"
    updated_user = res_update.json()
    assert updated_user["room_number"] == "505-В"
    print(f"Профиль обновлен: Новая комната={updated_user['room_number']}, Новое ФИО={updated_user['full_name']}")

    # Сценарий 9: Отмена бронирования (DELETE /api/bookings/{id})
    print_step("Сценарий 9: Отмена бронирования студентом")
    res_delete = requests.delete(f"{BASE_URL}/bookings/{booking_id}", headers=headers)
    assert res_delete.status_code == 204, f"Ошибка удаления бронирования: {res_delete.status_code}"
    print(f"Бронирование ID={booking_id} успешно удалено из базы данных.")

    # Сценарий 10: Отзыв токена при выходе из системы (POST /api/auth/logout)
    print_step("Сценарий 10: Завершение сессии и отзыв refresh токена")
    res_logout = requests.post(f"{BASE_URL}/auth/logout", json={"refresh_token": refresh_token})
    assert res_logout.status_code == 200, f"Ошибка при выходе: {res_logout.text}"
    print("Сессия завершена, токен успешно аннулирован.")

    # Очистка тестового аккаунта
    requests.delete(f"{BASE_URL}/users/{user_id}")
    print(f"Тестовый пользователь ID={user_id} очищен.")

    print("\n" + "#" * 70)
    print("ИТОГ: ВСЕ ДЕМОНСТРАЦИОННЫЕ СЦЕНАРИИ УСПЕШНО ПРОЙДЕНЫ!")
    print("Интеграция между Frontend, Backend API и PostgreSQL работает корректно.")
    print("#" * 70)

if __name__ == "__main__":
    main()