import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../lib/authStorage';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Прикрепляем токен авторизации
  const accessToken = getAccessToken();
  if (accessToken && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(url, { ...options, headers });
  } catch (netError) {
    // Перехват физического отсутствия сети или падения сервера бэкенда
    throw new Error('Не удалось связаться с сервером. Проверьте, запущен ли FastAPI (http://127.0.0.1:8000)');
  }

  // Если токен просрочен (401), пробуем продлить через refresh token
  if (response.status === 401 && !options.skipAuth) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          saveTokens(refreshData.access_token, refreshToken);

          headers.set('Authorization', `Bearer ${refreshData.access_token}`);
          response = await fetch(url, { ...options, headers });
        } else {
          clearTokens();
          throw new Error('Время вашей сессии истекло. Пожалуйста, выполните повторный вход.');
        }
      } catch {
        clearTokens();
        throw new Error('Время вашей сессии истекло. Пожалуйста, выполните повторный вход.');
      }
    } else {
      throw new Error('Для выполнения этого действия необходима авторизация в системе.');
    }
  }

  // Обработка статусных ошибок HTTP
  if (!response.ok) {
    let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;

    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        if (typeof errorJson.detail === 'string') {
          errorMessage = errorJson.detail;
        } else if (Array.isArray(errorJson.detail)) {
          // Читаемый парсинг ошибок валидации Pydantic
          errorMessage = errorJson.detail.map((d: { msg?: string }) => d.msg || 'Некорректные данные').join(', ');
        } else {
          errorMessage = JSON.stringify(errorJson.detail);
        }
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      if (response.status === 403) {
        errorMessage = 'Отказ в доступе: у вас недостаточно прав для выполнения этой операции.';
      } else if (response.status === 404) {
        errorMessage = 'Запрошенные данные не найдены на сервере.';
      } else if (response.status === 409) {
        errorMessage = 'Конфликт данных: выбранный интервал времени уже занят или ресурс существует.';
      } else if (response.status >= 500) {
        errorMessage = 'Внутренняя ошибка сервера. Повторите попытку позже.';
      }
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}