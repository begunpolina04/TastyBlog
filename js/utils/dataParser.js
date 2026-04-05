// js/utils/dataParser.js
// Утилиты для обработки данных из API и хранилищ

/**
 * Экранирование HTML-символов для защиты от XSS
 * Используется в: apiService.js
 */
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Парсинг сырых данных рецепта из TheMealDB в удобный формат
 * Используется в: apiService.js
 */
export function parseRecipeData(meal) {
  if (!meal) return null;

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      const measureText = measure ? measure.trim() : '';
      ingredients.push(`${measureText} ${ingredient.trim()}`.trim());
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory || 'Разное',
    area: meal.strArea || 'Международная',
    instructions: meal.strInstructions || 'Инструкции отсутствуют',
    image: meal.strMealThumb,
    tags: meal.strTags ? meal.strTags.split(',') : [],
    youtube: meal.strYoutube,
    ingredients: ingredients,
    source: meal.strSource,
    dateModified: meal.dateModified,
    timestamp: Date.now(),
  };
}

/**
 * Получить рецепт по ID из массива
 * Используется в: apiService.js
 */
export function findRecipeById(recipes, id) {
  return recipes.find((recipe) => recipe.id === id);
}

/**
 * Форматирование даты для отображения
 * Используется в: apiService.js (модальные окна)
 */
export function formatDisplayDate(timestamp) {
  if (!timestamp) return 'Дата неизвестна';
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Обрезка длинного текста
 * Используется в: apiService.js
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
