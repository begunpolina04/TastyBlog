import { StorageManager } from '../utils/storage.js';
import { escapeHtml, formatDate } from '../utils/helpers.js';

export class CommentsManager {
    constructor(storageKey) {
        this.storage = new StorageManager(storageKey);
    }

    add(recipeId, author, text) {
        const recipes = this.storage.get();
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (recipe) {
            if (!recipe.comments) recipe.comments = [];
            recipe.comments.push({ 
                author: author.trim(), 
                text: text.trim(), 
                timestamp: Date.now() 
            });
            this.storage.save(recipes);
            return true;
        }
        return false;
    }

    delete(recipeId, index) {
        const recipes = this.storage.get();
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (recipe && recipe.comments && recipe.comments[index]) {
            recipe.comments.splice(index, 1);
            this.storage.save(recipes);
            return true;
        }
        return false;
    }

    renderComments(recipeId) {
        const recipes = this.storage.get();
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe || !recipe.comments) return '';
        
        return `
            <div class="comments-section">
                <h3>💬 Комментарии (${recipe.comments.length})</h3>
                <form id="comment-form" onsubmit="window.addCommentHandler('${recipeId}'); return false;">
                    <input type="text" id="comment-author" class="comment-author" placeholder="Ваше имя" required>
                    <textarea id="comment-text" class="comment-input" placeholder="Ваш комментарий..." rows="3" required></textarea>
                    <button type="submit" class="comment-submit">Добавить комментарий</button>
                </form>
                <div id="comments-list">
                    ${recipe.comments.length === 0 ? 
                        '<p>Пока нет комментариев</p>' : 
                        recipe.comments.map((c, i) => `
                            <div class="comment-item">
                                <div class="comment-header">
                                    <strong>${escapeHtml(c.author)}</strong>
                                    <span>${formatDate(c.timestamp)}</span>
                                    <button onclick="window.deleteCommentHandler('${recipeId}', ${i})" 
                                            style="background:none; border:none; color:#ff6b6b; cursor:pointer;">🗑️</button>
                                </div>
                                <p>${escapeHtml(c.text)}</p>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;
    }
}