export class Timer {
    constructor() {
        this.interval = null;
        this.seconds = 0;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    start(displayElement, onTick) {
        if (this.interval) return;
        
        this.interval = setInterval(() => {
            if (this.seconds > 0) {
                this.seconds--;
                if (displayElement) displayElement.textContent = this.formatTime(this.seconds);
                if (onTick) onTick(this.seconds);
                
                if (this.seconds === 0) {
                    this.stop();
                    if (onTick) onTick(0);
                }
            }
        }, 1000);
    }

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    stop() {
        this.pause();
        this.seconds = 0;
    }

    reset(minutes, displayElement) {
        this.pause();
        this.seconds = minutes * 60;
        if (displayElement) displayElement.textContent = this.formatTime(this.seconds);
    }

    addMinute(displayElement) {
        this.seconds += 60;
        if (displayElement) displayElement.textContent = this.formatTime(this.seconds);
    }

    getSeconds() {
        return this.seconds;
    }
}