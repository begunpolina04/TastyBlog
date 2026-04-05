// js/storage/localStorage.js
// НЕ импортируем isFavorite из dataParser.js, потому что своя функция уже есть

const FAVORITES_KEY = 'tastyblog_favorites';

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

export function saveToFavorites(recipe) {
  const favorites = getFavorites();
  if (!favorites.some((f) => f.id === recipe.id)) {
    favorites.push({
      ...recipe,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    cacheFavoritesForOffline();
  }
}

export function getFavorites() {
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
}

export function removeFromFavorites(id) {
  const favorites = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  cacheFavoritesForOffline();
}

// Своя функция isFavorite (НЕ импортируем из dataParser)
export function isFavorite(id) {
  return getFavorites().some((f) => f.id === id);
}

export function clearAllFavorites() {
  localStorage.removeItem(FAVORITES_KEY);
  cacheFavoritesForOffline();
}

export function getFavoritesCount() {
  return getFavorites().length;
}

// ========== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ОФФЛАЙН-ДОСТУПА ==========

export function cacheFavoritesForOffline() {
  try {
    const favorites = getFavorites();
    const cacheData = {
      data: favorites,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(
      'tastyblog_offline_favorites',
      JSON.stringify(cacheData)
    );
  } catch (error) {
    console.error('Ошибка кэширования избранного:', error);
  }
}

export function getCachedFavorites() {
  try {
    const cached = sessionStorage.getItem('tastyblog_offline_favorites');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 86400000) {
        return parsed.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения кэша избранного:', error);
    return null;
  }
}

export function exportFavorites() {
  const favorites = getFavorites();
  return JSON.stringify(favorites, null, 2);
}

export function importFavorites(jsonString) {
  try {
    const favorites = JSON.parse(jsonString);
    if (Array.isArray(favorites)) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      cacheFavoritesForOffline();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Ошибка импорта избранного:', error);
    return false;
  }
}

export function isOnline() {
  return navigator.onLine;
}

export function getFavoritesWithOfflineSupport() {
  if (isOnline()) {
    return getFavorites();
  } else {
    const cached = getCachedFavorites();
    return cached || [];
  }
}
