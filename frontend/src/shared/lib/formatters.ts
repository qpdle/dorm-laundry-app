// Форматирование даты в виде: "день месяц год"
export const formatDateRussian = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Форматирование времени в виде: "10:00"
export const formatTimeShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Проверка пересечения временных интервалов (для валидации на клиенте перед отправкой в API)
export const isTimeOverlapping = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean => {
  return startA < endB && endA > startB;
};