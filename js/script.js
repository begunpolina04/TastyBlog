document.addEventListener('DOMContentLoaded', function() {
    console.log('TastyBlog загружен');
    
    const title = document.querySelector('h1');
    if (title) {
        title.addEventListener('click', function() {
            alert('Добро пожаловать в TastyBlog!');
        });
    }
});