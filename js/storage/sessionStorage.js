// js/storage/sessionStorage.js
// Вспомогательные функции для кэширования API-запросов
import { escapeHtml } from '../utils/dataParser.js';
// Сохранить результаты поиска в кэш
export function cacheSearchResults(query, results) {
  try {
    const cacheKey = `tastyblog_search_${query.toLowerCase()}`;
    const cacheData = {
      results: results,
      timestamp: Date.now(),
      query: query,
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Ошибка кэширования поиска:', error);
  }
}

// Получить кэшированные результаты поиска
export function getCachedSearchResults(query, maxAge = 3600000) {
  try {
    const cacheKey = `tastyblog_search_${query.toLowerCase()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < maxAge) {
        return parsed.results;
      }
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения кэша поиска:', error);
    return null;
  }
}

// Сохранить последние загруженные рецепты
export function cacheLastRecipes(recipes) {
  try {
    const cacheData = {
      data: recipes,
      timestamp: Date.now(),
    };
    sessionStorage.setItem('tastyblog_last_recipes', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Ошибка кэширования рецептов:', error);
  }
}

// Получить последние загруженные рецепты из кэша
export function getCachedLastRecipes() {
  try {
    const cached = sessionStorage.getItem('tastyblog_last_recipes');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 86400000) {
        // 24 часа
        return parsed.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения кэша рецептов:', error);
    return null;
  }
}

// Очистить весь кэш API
export function clearAPICache() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('tastyblog_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Ошибка очистки кэша:', error);
  }
}
