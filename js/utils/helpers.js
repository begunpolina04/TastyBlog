// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ВАЛИДАЦИИ ==========

// Валидация названия рецепта (не пустое, минимум 3 символа)
export const validateRecipeName = (name) => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, message: 'Название рецепта обязательно' };
    }
    if (name.trim().length < 3) {
        return { isValid: false, message: 'Название должно содержать минимум 3 символа' };
    }
    if (name.trim().length > 50) {
        return { isValid: false, message: 'Название не должно превышать 50 символов' };
    }
    return { isValid: true, message: '' };
};

// Валидация времени приготовления
export const validateTime = (time) => {
    const timeNum = parseInt(time);
    if (isNaN(timeNum) || timeNum <= 0) {
        return { isValid: false, message: 'Введите корректное время (положительное число)' };
    }
    if (timeNum > 180) {
        return { isValid: false, message: 'Время не должно превышать 180 минут' };
    }
    return { isValid: true, message: '' };
};

// Валидация описания
export const validateDescription = (description) => {
    if (!description || description.trim().length === 0) {
        return { isValid: false, message: 'Описание рецепта обязательно' };
    }
    if (description.trim().length < 10) {
        return { isValid: false, message: 'Описание должно содержать минимум 10 символов' };
    }
    if (description.trim().length > 500) {
        return { isValid: false, message: 'Описание не должно превышать 500 символов' };
    }
    return { isValid: true, message: '' };
};

// Валидация URL изображения (опционально)
export const validateImageUrl = (url) => {
    if (!url || url.trim() === '') {
        return { isValid: true, message: '' }; // Необязательное поле
    }
    // Простая проверка на расширение изображения
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => lowerUrl.endsWith(ext));
    
    if (!hasValidExtension) {
        return { isValid: false, message: 'Укажите корректный URL изображения (.jpg, .png, .gif)' };
    }
    return { isValid: true, message: '' };
};

// Показать ошибку
export const showError = (element, message) => {
    element.style.borderColor = '#ff6b6b';
    element.style.backgroundColor = '#fff5f5';
    
    // Удаляем существующую ошибку
    clearErrors(element);
    
    // Создаем элемент для ошибки
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    Object.assign(errorElement.style, {
    color: '#ff6b6b',
    fontSize: '12px',
    marginTop: '5px',
    fontFamily: "'Open Sans', sans-serif"
    });
    element.parentNode.appendChild(errorElement);
};

// Очистить ошибки
export const clearErrors = (element) => {
    element.style.borderColor = '';
    element.style.backgroundColor = '';
    const errorElement = element.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
};

// Очистить все ошибки в форме
export const clearAllErrors = (form) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => clearErrors(input));
};

// Валидация всей формы рецепта
export const validateRecipeForm = (name, time, description, image) => {
    const errors = [];
    
    const nameValidation = validateRecipeName(name);
    if (!nameValidation.isValid) errors.push(nameValidation.message);
    
    const timeValidation = validateTime(time);
    if (!timeValidation.isValid) errors.push(timeValidation.message);
    
    const descValidation = validateDescription(description);
    if (!descValidation.isValid) errors.push(descValidation.message);
    
    const imageValidation = validateImageUrl(image);
    if (!imageValidation.isValid) errors.push(imageValidation.message);
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Добавьте в конец файла helpers.js:

// Защита от XSS
export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Форматирование даты
export function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Показ уведомлений
export function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('TastyBlog', { body: message });
    }
    
    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#ff6b6b',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    zIndex: '2001',
    animation: 'slideIn 0.3s ease',
    fontFamily: "'Open Sans', sans-serif",
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
});
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}