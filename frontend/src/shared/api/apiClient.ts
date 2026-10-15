import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../lib/authStorage';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Прикрепляем access token, если он есть в хранилище
  const accessToken = getAccessToken();
  if (accessToken && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(url, { ...options, headers });

  // Если токен истёк (401), пробуем автоматически продлить через refresh token
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

          // Повторяем исходный запрос с новым access токеном
          headers.set('Authorization', `Bearer ${refreshData.access_token}`);
          response = await fetch(url, { ...options, headers });
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Игнорируем ошибку чтения JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}