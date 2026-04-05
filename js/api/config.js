export const API_CONFIG = {
  themealdb: {
    url: 'https://www.themealdb.com/api/json/v1/1',
    apikey: null,
    endpoints: {
      search: '/search.php',
      lookup: '/lookup.php',
      random: '/random.php',
      categories: '/categories.php',
      filterByCategory: '/filter.php',
      filterByArea: '/filter.php',
      filterByIngredient: '/filter.php',
    },
  },
};

// Fallback данные для демонстрации при недоступности API
export const FALLBACK_DATA = {
  recipes: [
    {
      idMeal: '52999',
      strMeal: 'Пример рецепта: Паста Карбонара',
      strCategory: 'Pasta',
      strArea: 'Italian',
      strInstructions:
        'Это пример рецепта для оффлайн-режима. Подключитесь к интернету, чтобы загрузить реальные рецепты.',
      strMealThumb:
        'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
    },
  ],
  message: 'Нет подключения к интернету. Показываются примерные данные.',
};

export const CURRENT_API = 'themealdb';
