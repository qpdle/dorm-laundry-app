const ACCESS_TOKEN_KEY = "dorm_laundry_access_token";
const REFRESH_TOKEN_KEY = "dorm_laundry_refresh_token";

/** Сохранение пары токенов в localStorage браузера */
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/** Получение сохранённого access token */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/** Получение сохранённого refresh token */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/** Очистка токенов из localStorage при выходе */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};