import { escapeHtml } from '../utils/helpers.js';

export class RecipeCardRenderer {
    static render(recipe, onEdit, onDelete, onOpenDetail) {
        return `
            <article class="recipe-card" data-id="${recipe.id}">
                <figure class="recipe-card__figure">
                    <img src="${recipe.image || 'images/default-recipe.png'}" 
                         alt="${escapeHtml(recipe.name)}" 
                         class="recipe-card__image" 
                         onerror="this.src='images/default-recipe.png'">
                    <figcaption class="recipe-card__figcaption">Фото блюда</figcaption>
                </figure>
                <h3 class="recipe-card__title">
                    <a href="javascript:void(0)" 
                       class="recipe-card__link" 
                       onclick="window.openRecipeDetailHandler('${recipe.id}')">
                        ${escapeHtml(recipe.name)}
                    </a>
                </h3>
                <div class="recipe-card__info">
                    <img src="images/time_icon.svg" alt="Время" class="recipe-card__time-icon">
                    <p class="recipe-card__time">${recipe.time} мин</p>
                </div>
                <div class="recipe-card__actions" style="margin: 10px 15px 15px 15px; display: flex; gap: 8px;">
                    <button class="edit-btn" data-id="${recipe.id}">✏️ Редактировать</button>
                    <button class="delete-btn" data-id="${recipe.id}">🗑️ Удалить</button>
                </div>
            </article>
        `;
    }

    static renderEmpty() {
        return '<p style="text-align:center; grid-column:1/-1; padding: 40px;">Рецептов не найдено. Добавьте первый рецепт!</p>';
    }
}