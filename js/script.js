import { StorageManager } from './utils/storage.js';
import { defaultRecipes } from './data/defaultRecipes.js';
import { ModalManager } from './components/modal.js';
import { Timer } from './components/timer.js';
import { CommentsManager } from './components/comments.js';
import { RecipeCardRenderer } from './components/recipeCard.js';
import { 
    validateRecipeForm, 
    validateRecipeName, 
    validateTime, 
    validateDescription, 
    validateImageUrl,
    showError, 
    clearErrors, 
    clearAllErrors,
    escapeHtml,
    formatDate,
    showNotification
} from './utils/helpers.js';

// ИНИЦИАЛИЗАЦИЯ 
const storage = new StorageManager('tastyblog_recipes', defaultRecipes);
const modal = new ModalManager('recipe-modal', 'recipe-detail');
const timer = new Timer();
const comments = new CommentsManager('tastyblog_recipes');

// Состояние приложения
let state = {
    recipes: storage.get(),
    currentPage: 0,
    itemsPerPage: 4,
    currentCategory: 'all',
    editingId: null
};

// ОСНОВНЫЕ ФУНКЦИИ 
function filterRecipes(recipes) {
    let filtered = [...recipes];
    
    // Поиск
    const searchInput = document.getElementById('recipe-search');
    const searchTerm = searchInput?.value.toLowerCase().trim() || '';
    if (searchTerm) {
        filtered = filtered.filter(recipe => 
            recipe.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Категория
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(recipe => {
            if (state.currentCategory === 'quick') {
                return parseInt(recipe.time) <= 30;
            }
            return recipe.category === state.currentCategory;
        });
    }
    
    // Сортировка
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    return filtered;
}

function paginate(recipes) {
    const totalPages = Math.ceil(recipes.length / state.itemsPerPage);
    if (state.currentPage >= totalPages && totalPages > 0) {
        state.currentPage = totalPages - 1;
    }
    if (state.currentPage < 0) state.currentPage = 0;
    
    const start = state.currentPage * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    
    return {
        pageRecipes: recipes.slice(start, end),
        totalPages
    };
}

function displayRecipes() {
    const recipesGrid = document.getElementById('recipes-grid');
    if (!recipesGrid) return;
    
    const filtered = filterRecipes(state.recipes);
    const { pageRecipes, totalPages } = paginate(filtered);
    
    if (pageRecipes.length === 0) {
        recipesGrid.innerHTML = RecipeCardRenderer.renderEmpty();
    } else {
        recipesGrid.innerHTML = pageRecipes.map(recipe => 
            RecipeCardRenderer.render(recipe, editRecipe, deleteRecipe, openRecipeDetail)
        ).join('');
    }
    
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const dotsContainer = document.getElementById('recipes-dots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('span');
        dot.className = `popular__dot ${i === state.currentPage ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            state.currentPage = i;
            displayRecipes();
        });
        dotsContainer.appendChild(dot);
    }
}

function saveAndRefresh(recipes) {
    storage.save(recipes);
    state.recipes = recipes;
    displayRecipes();
}

// CRUD 
function addRecipe(name, time, description, image, category) {
    const newRecipe = {
        id: Date.now().toString(),
        name: name.trim(),
        time: time.trim(),
        description: description.trim(),
        image: image.trim() || 'images/default-recipe.png',
        category: category || 'all',
        timestamp: Date.now(),
        comments: []
    };
    
    const recipes = [newRecipe, ...state.recipes];
    saveAndRefresh(recipes);
    return true;
}

function editRecipe(id) {
    const recipe = state.recipes.find(r => r.id === id);
    if (!recipe) return;
    
    state.editingId = id;
    
    document.getElementById('recipe-name').value = recipe.name;
    document.getElementById('recipe-time').value = recipe.time;
    document.getElementById('recipe-description').value = recipe.description;
    document.getElementById('recipe-image').value = recipe.image || '';
    
    const categorySelect = document.getElementById('recipe-category');
    if (categorySelect) categorySelect.value = recipe.category || 'all';
    
    const submitBtn = document.getElementById('recipe-submit-btn');
    const cancelBtn = document.getElementById('recipe-cancel-btn');
    
    submitBtn.textContent = 'Обновить рецепт';
    submitBtn.style.background = '#4ecdc4';
    cancelBtn.style.display = 'inline-block';
    
    document.querySelector('.recipe-form-container').scrollIntoView({ behavior: 'smooth' });
}

function updateRecipe(id, name, time, description, image, category) {
    const index = state.recipes.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    state.recipes[index] = {
        ...state.recipes[index],
        name: name.trim(),
        time: time.trim(),
        description: description.trim(),
        image: image.trim() || state.recipes[index].image,
        category: category || state.recipes[index].category,
        updatedAt: Date.now()
    };
    
    saveAndRefresh(state.recipes);
    resetRecipeForm();
    return true;
}

function deleteRecipe(id) {
    if (!confirm('Вы уверены, что хотите удалить этот рецепт?')) return;
    
    const recipes = state.recipes.filter(recipe => recipe.id !== id);
    saveAndRefresh(recipes);
    
    if (state.editingId === id) resetRecipeForm();
}

function resetRecipeForm() {
    state.editingId = null;
    const form = document.getElementById('recipe-form');
    if (form) form.reset();
    
    const submitBtn = document.getElementById('recipe-submit-btn');
    const cancelBtn = document.getElementById('recipe-cancel-btn');
    
    if (submitBtn) {
        submitBtn.textContent = 'Добавить рецепт';
        submitBtn.style.background = '#efebe6';
    }
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// ОТОБРАЖЕНИЕ ДЕТАЛЕЙ
function openRecipeDetail(recipeId) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const content = `
        <span class="recipe-modal__close" onclick="modal.close()">&times;</span>
        <h2>${escapeHtml(recipe.name)}</h2>
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <span>⏱️ ${recipe.time} минут</span>
            <span>📅 ${formatDate(recipe.timestamp)}</span>
        </div>
        <p>${escapeHtml(recipe.description)}</p>
        <img src="${recipe.image}" style="max-width: 100%; border-radius: 15px; margin: 15px 0;" 
             onerror="this.src='images/default-recipe.png'">
        
        <div class="timer-section">
            <h3>⏱️ Таймер приготовления</h3>
            <button class="timer-control-btn" onclick="window.openTimerHandler(${recipe.time}, '${escapeHtml(recipe.name)}')">
                ▶️ Запустить таймер
            </button>
        </div>
        
        ${comments.renderComments(recipeId)}
    `;
    
    modal.open(content);
}

function openTimer(minutes, recipeName) {
    const content = `
        <span class="recipe-modal__close" onclick="modal.close()">&times;</span>
        <h2>⏱️ Таймер: ${escapeHtml(recipeName)}</h2>
        <div class="timer-section">
            <div class="timer-display" id="timer-display">${timer.formatTime(minutes * 60)}</div>
            <div class="timer-controls">
                <button class="timer-control-btn" onclick="window.startTimerHandler()">▶️ Старт</button>
                <button class="timer-control-btn" onclick="window.pauseTimerHandler()">⏸️ Пауза</button>
                <button class="timer-control-btn" onclick="window.resetTimerHandler(${minutes})">🔄 Сброс</button>
                <button class="timer-control-btn" onclick="window.addMinuteHandler()">+1 мин</button>
            </div>
        </div>
    `;
    
    timer.reset(minutes);
    modal.open(content, () => timer.stop());
}

function startTimerHandler() {
    const display = document.getElementById('timer-display');
    timer.start(display, (seconds) => {
        if (seconds === 60) showNotification(' Осталась 1 минута!');
        if (seconds === 0) {
            showNotification(' Время вышло! Приятного аппетита!');
            if (display) {
                display.style.background = '#ff6b6b';
                display.style.color = 'white';
            }
        }
    });
}

// ФОРМА И ВАЛИДАЦИЯ
function initRecipeForm() {
    const form = document.getElementById('recipe-form');
    if (!form) return;
    
    const inputs = {
        name: document.getElementById('recipe-name'),
        time: document.getElementById('recipe-time'),
        description: document.getElementById('recipe-description'),
        image: document.getElementById('recipe-image')
    };
    
    // Валидация в реальном времени
    Object.entries(inputs).forEach(([field, input]) => {
        if (!input) return;
        
        const validators = {
            name: validateRecipeName,
            time: validateTime,
            description: validateDescription,
            image: validateImageUrl
        };
        
        input.addEventListener('blur', () => {
            clearErrors(input);
            const validation = validators[field](input.value);
            if (!validation.isValid) showError(input, validation.message);
        });
        
        input.addEventListener('input', () => clearErrors(input));
    });
      const searchInput = document.getElementById('recipe-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            state.currentPage = 0;  
            displayRecipes();   
        });
    }
    // Отправка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors(form);
        
        const formData = {
            name: inputs.name?.value || '',
            time: inputs.time?.value || '',
            description: inputs.description?.value || '',
            image: inputs.image?.value || ''
        };
        
        const validation = validateRecipeForm(
            formData.name, formData.time, formData.description, formData.image
        );
        
        if (!validation.isValid) {
            alert('Пожалуйста, исправьте ошибки:\n- ' + validation.errors.join('\n- '));
            return;
        }
        
        const category = document.getElementById('recipe-category')?.value || 'all';
        
        if (state.editingId) {
            updateRecipe(state.editingId, formData.name, formData.time, 
                        formData.description, formData.image, category);
            showNotification('✅ Рецепт успешно обновлен!');
        } else {
            addRecipe(formData.name, formData.time, formData.description, 
                     formData.image, category);
            showNotification('✅ Рецепт успешно добавлен!');
        }
        
        form.reset();
        resetRecipeForm();
    });
}

// НАВИГАЦИЯ
function initNavigation() {
    const leftArrow = document.querySelector('.popular__nav-left');
    const rightArrow = document.querySelector('.popular__nav-right');
    
    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            const filtered = filterRecipes(state.recipes);
            const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
            if (state.currentPage > 0) {
                state.currentPage--;
                displayRecipes();
            }
        });
    }
    
    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            const filtered = filterRecipes(state.recipes);
            const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
            if (state.currentPage < totalPages - 1) {
                state.currentPage++;
                displayRecipes();
            }
        });
    }
}

// ТАБЫ
function initTabs() {
    const categoryBtns = document.querySelectorAll('.category-compact');
    const allBtn = document.querySelector('.categories-compact__all');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (allBtn) allBtn.classList.remove('active');
            state.currentCategory = this.dataset.category;
            state.currentPage = 0;
            displayRecipes();
        });
    });
    
    if (allBtn) {
        allBtn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.currentCategory = 'all';
            state.currentPage = 0;
            displayRecipes();
        });
    }
}

// ОБРАБОТЧИКИ КОММЕНТАРИЕВ
function addCommentHandler(recipeId) {
    const author = document.getElementById('comment-author')?.value.trim();
    const text = document.getElementById('comment-text')?.value.trim();
    
    if (!author || !text) {
        alert('Заполните имя и комментарий');
        return;
    }
    
    if (comments.add(recipeId, author, text)) {
        state.recipes = storage.get();
        openRecipeDetail(recipeId);
    }
}

function deleteCommentHandler(recipeId, index) {
    if (confirm('Удалить комментарий?')) {
        if (comments.delete(recipeId, index)) {
            state.recipes = storage.get();
            openRecipeDetail(recipeId);
        }
    }
}

// ГЛОБАЛЬНЫЕ ХЕНДЛЕРЫ
window.openRecipeDetailHandler = openRecipeDetail;
window.openTimerHandler = openTimer;
window.startTimerHandler = startTimerHandler;
window.pauseTimerHandler = () => timer.pause();
window.resetTimerHandler = (minutes) => {
    const display = document.getElementById('timer-display');
    timer.reset(minutes, display);
};
window.addMinuteHandler = () => {
    const display = document.getElementById('timer-display');
    timer.addMinute(display);
};
window.addCommentHandler = addCommentHandler;
window.deleteCommentHandler = deleteCommentHandler;
window.modal = modal;

// ДЕЛЕГИРОВАНИЕ СОБЫТИЙ
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        editRecipe(e.target.dataset.id);
    }
    if (e.target.classList.contains('delete-btn')) {
        deleteRecipe(e.target.dataset.id);
    }
});

// ЗАПУСК
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    initRecipeForm();
    initNavigation();
    initTabs();
    displayRecipes();
});