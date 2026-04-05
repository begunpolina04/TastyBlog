// js/api/apiService.js - ИСПРАВЛЕННАЯ ВЕРСИЯ (РАБОТАЕТ ПОДРОБНЕЕ)

import {
  saveToFavorites,
  getFavorites,
  removeFromFavorites,
  isFavorite,
} from '../storage/localStorage.js';

// Импортируем утилиты из dataParser.js
import {
  escapeHtml,
  parseRecipeData,
  findRecipeById,
  formatDisplayDate,
  truncateText,
} from '../utils/dataParser.js';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Флаги для предотвращения повторных запросов
let isLoading = false;
let isInitialized = false;

function showMessage(text, isError = false) {
  let toast = document.getElementById('api-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'api-toast';
    toast.className = 'api-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.background = isError ? '#ff4444' : '#4ecdc4';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}

export async function getRandomRecipe() {
  const response = await fetch(`${BASE_URL}/random.php`);
  return response.json();
}

export async function searchRecipes(query) {
  const response = await fetch(
    `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`
  );
  return response.json();
}

// Глобальная переменная для текущих рецептов
let currentRecipes = [];

function renderRecipes(recipes) {
  const container = document.getElementById('api-recipes-container');
  if (!container) return;

  if (!recipes || recipes.length === 0) {
    container.innerHTML =
      '<div class="api-message">😕 Рецепты не найдены</div>';
    return;
  }

  container.innerHTML = recipes
    .map(
      (recipe) => `
    <div class="api-recipe-card">
      <img class="api-recipe-card__image" src="${recipe.image}" alt="${recipe.name}" onerror="this.onerror=null; this.src='images/default-recipe.png'">
      <div class="api-recipe-card__content">
        <h4 class="api-recipe-card__title">${escapeHtml(recipe.name)}</h4>
        <p class="api-recipe-card__meta">${recipe.category} • ${recipe.area || 'Разное'}</p>
        <div class="api-recipe-card__buttons">
          <button class="api-recipe-card__btn api-recipe-card__btn--detail" data-id="${recipe.id}">
            👁️ Подробнее
          </button>
          <button class="api-recipe-card__btn api-recipe-card__btn--favorite ${isFavorite(recipe.id) ? 'active' : ''}" data-id="${recipe.id}">
            ${isFavorite(recipe.id) ? '⭐ В избранном' : '☆ В избранное'}
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  // Сохраняем рецепты для доступа по ID
  currentRecipes = recipes;

  // Навешиваем обработчики (ПРОСТОЙ СПОСОБ - без cloneNode)
  document.querySelectorAll('.api-recipe-card__btn--detail').forEach((btn) => {
    // Удаляем старые обработчики через замену
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = newBtn.getAttribute('data-id');
      const recipe = currentRecipes.find((r) => r.id === id);
      if (recipe) {
        showRecipeDetail(recipe);
      } else {
        console.error('Рецепт не найден:', id);
      }
    });
  });

  document
    .querySelectorAll('.api-recipe-card__btn--favorite')
    .forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = newBtn.getAttribute('data-id');
        const recipe = currentRecipes.find((r) => r.id === id);
        if (recipe) {
          toggleFavorite(recipe);
          renderRecipes(currentRecipes);
          renderFavoritesList();
        }
      });
    });
}

function renderFavoritesList() {
  const container = document.getElementById('favorites-api-list');
  if (!container) return;

  const favorites = getFavorites();

  if (favorites.length === 0) {
    container.innerHTML =
      '<p class="favorites-api__empty">⭐ Нет избранных рецептов</p>';
    return;
  }

  container.innerHTML = favorites
    .map(
      (recipe) => `
    <div class="favorite-api-item">
      <span class="favorite-api-item__name" data-id="${recipe.id}">
        ${escapeHtml(recipe.name)}
      </span>
      <button class="favorite-api-item__remove" data-id="${recipe.id}">✖</button>
    </div>
  `
    )
    .join('');

  document.querySelectorAll('.favorite-api-item__name').forEach((span) => {
    const newSpan = span.cloneNode(true);
    span.parentNode.replaceChild(newSpan, span);
    newSpan.addEventListener('click', () => {
      const id = newSpan.getAttribute('data-id');
      const recipe = favorites.find((r) => r.id === id);
      if (recipe) showRecipeDetail(recipe);
    });
  });

  document.querySelectorAll('.favorite-api-item__remove').forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const id = newBtn.getAttribute('data-id');
      const recipe = favorites.find((r) => r.id === id);
      if (recipe) {
        toggleFavorite(recipe);
        renderFavoritesList();
        if (currentRecipes.length) renderRecipes(currentRecipes);
      }
    });
  });
}

function showRecipeDetail(recipe) {
  console.log('Открываем детали рецепта:', recipe.name);

  const ingredientsList = recipe.ingredients
    .map((i) => `<li>${escapeHtml(i)}</li>`)
    .join('');

  // Удаляем старый модал, если есть
  const oldModal = document.getElementById('recipe-detail-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'recipe-detail-modal';
  modal.className = 'recipe-detail-modal';
  modal.innerHTML = `
    <div class="recipe-detail-modal__content">
      <button class="recipe-detail-modal__close">&times;</button>
      <h2>${escapeHtml(recipe.name)}</h2>
      <img class="recipe-detail-modal__image" src="${recipe.image}" onerror="this.onerror=null; this.src='images/default-recipe.png'">
      <h3>📝 Ингредиенты:</h3>
      <ul class="recipe-detail-modal__ingredients">${ingredientsList}</ul>
      <h3>👨‍🍳 Приготовление:</h3>
      <p>${escapeHtml(recipe.instructions)}</p>
      <button class="recipe-detail-modal__favorite-btn" data-id="${recipe.id}">
        ${isFavorite(recipe.id) ? '⭐ В избранном' : '☆ Добавить в избранное'}
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.recipe-detail-modal__close').onclick = () =>
    modal.remove();
  modal.querySelector('.recipe-detail-modal__favorite-btn').onclick = () => {
    toggleFavorite(recipe);
    renderFavoritesList();
    if (currentRecipes.length) renderRecipes(currentRecipes);
    modal.remove();
  };
}

function toggleFavorite(recipe) {
  if (isFavorite(recipe.id)) {
    removeFromFavorites(recipe.id);
    showMessage('⭐ Удалено из избранного');
  } else {
    saveToFavorites(recipe);
    showMessage('❤️ Добавлено в избранное!');
  }
}

async function loadRandomRecipes() {
  if (isLoading) return;
  isLoading = true;

  const container = document.getElementById('api-recipes-container');
  if (!container) {
    isLoading = false;
    return;
  }

  container.innerHTML =
    '<div class="api-message">🔄 Загрузка рецептов...</div>';

  try {
    const data = await getRandomRecipe();
    if (data && data.meals) {
      const recipes = data.meals.map(parseRecipeData);
      currentRecipes = recipes;
      renderRecipes(recipes);
      showMessage(`🍽️ Загружено ${recipes.length} рецептов!`);
    } else {
      container.innerHTML =
        '<div class="api-message">😕 Рецепты не найдены</div>';
    }
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<div class="api-error">❌ Ошибка загрузки. Проверьте интернет.</div>';
  } finally {
    isLoading = false;
  }
}

async function searchRecipesUI(query) {
  if (isLoading) return;

  if (!query.trim()) {
    loadRandomRecipes();
    return;
  }

  isLoading = true;
  const container = document.getElementById('api-recipes-container');
  if (!container) {
    isLoading = false;
    return;
  }

  container.innerHTML = '<div class="api-message">🔍 Поиск...</div>';

  try {
    const data = await searchRecipes(query);
    if (data && data.meals && data.meals.length > 0) {
      const recipes = data.meals.map(parseRecipeData);
      currentRecipes = recipes;
      renderRecipes(recipes);
      showMessage(`🔍 Найдено ${recipes.length} рецептов!`);
    } else {
      container.innerHTML = `<div class="api-message">😕 Рецепты по запросу "${escapeHtml(query)}" не найдены</div>`;
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = '<div class="api-error">❌ Ошибка поиска</div>';
  } finally {
    isLoading = false;
  }
}

function openFavoritesModal() {
  const favorites = getFavorites();
  if (favorites.length === 0) {
    showMessage('Нет избранных рецептов');
    return;
  }

  const oldModal = document.getElementById('favorites-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'favorites-modal';
  modal.className = 'favorites-modal';
  modal.innerHTML = `
    <div class="favorites-modal__content">
      <button class="favorites-modal__close">&times;</button>
      <h2 class="favorites-modal__title">⭐ Моё избранное</h2>
      <div id="favorites-modal-list">
        ${favorites
          .map(
            (recipe) => `
          <div class="favorites-modal__item">
            <span class="favorites-modal__item-name" data-id="${recipe.id}">
              ${escapeHtml(recipe.name)}
            </span>
            <button class="favorites-modal__item-remove" data-id="${recipe.id}">✖</button>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.favorites-modal__close').onclick = () => modal.remove();

  modal.querySelectorAll('.favorites-modal__item-name').forEach((span) => {
    const newSpan = span.cloneNode(true);
    span.parentNode.replaceChild(newSpan, span);
    newSpan.onclick = () => {
      const id = newSpan.getAttribute('data-id');
      const recipe = favorites.find((r) => r.id === id);
      if (recipe) {
        modal.remove();
        showRecipeDetail(recipe);
      }
    };
  });

  modal.querySelectorAll('.favorites-modal__item-remove').forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.onclick = () => {
      const id = newBtn.getAttribute('data-id');
      const recipe = favorites.find((r) => r.id === id);
      if (recipe) {
        toggleFavorite(recipe);
        modal.remove();
        openFavoritesModal();
        renderFavoritesList();
        if (currentRecipes.length) renderRecipes(currentRecipes);
      }
    };
  });
}

function initAPI() {
  if (isInitialized) return;
  isInitialized = true;

  const randomBtn = document.getElementById('api-random-btn');
  const searchBtn = document.getElementById('api-search-btn');
  const searchInput = document.getElementById('api-search-input');

  if (randomBtn) {
    randomBtn.addEventListener('click', loadRandomRecipes);
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (searchInput) searchRecipesUI(searchInput.value);
    });
  }
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchRecipesUI(searchInput.value);
    });
  }

  loadRandomRecipes();
  renderFavoritesList();
}

function initFavIcon() {
  const icon = document.querySelector(
    '.header__icons img[alt="Избранное"]'
  )?.parentElement;
  if (icon) {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      openFavoritesModal();
    });
  }
}

// Запуск
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAPI();
    initFavIcon();
  });
} else {
  setTimeout(() => {
    initAPI();
    initFavIcon();
  }, 100);
}

export default { getRandomRecipe, searchRecipes };
