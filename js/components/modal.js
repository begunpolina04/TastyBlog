export class ModalManager {
    constructor(modalId, contentId) {
        this.modal = document.getElementById(modalId);
        this.content = document.getElementById(contentId);
        this.onClose = null;
        
        if (this.modal) {
            window.onclick = (event) => {
                if (event.target === this.modal) this.close();
            };
        }
    }

    open(content, onClose = null) {
        if (!this.modal || !this.content) return;
        this.content.innerHTML = content;
        this.modal.style.display = 'flex';
        this.onClose = onClose;
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
            if (this.onClose) this.onClose();
        }
    }

    clear() {
        if (this.content) this.content.innerHTML = '';
    }
}