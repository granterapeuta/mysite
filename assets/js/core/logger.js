// assets/js/core/logger.js
export class Logger {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.colors = {
            info: '#3498db',
            success: '#2ecc71',
            warn: '#f39c12',
            error: '#e74c3c',
            debug: '#9b59b6'
        };
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const style = `color: ${this.colors[level]}; font-weight: bold;`;

        console.log(
            `%c[${timestamp}] ${this.moduleName.toUpperCase()}: ${message}`,
            style,
            data || ''
        );

        // Guardar en localStorage para debugging
        this.saveToStorage(level, message, data, timestamp);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    success(message, data = null) {
        this.log('success', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    debug(message, data = null) {
        if (this.isDevelopment()) {
            this.log('debug', message, data);
        }
    }

    saveToStorage(level, message, data, timestamp) {
        try {
            const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
            logs.push({
                module: this.moduleName,
                level,
                message,
                data,
                timestamp,
                url: window.location.href
            });

            // Mantener solo los últimos 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }

            localStorage.setItem('app_logs', JSON.stringify(logs));
        } catch (error) {
            console.warn('No se pudieron guardar los logs:', error);
        }
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.search.includes('debug=true');
    }
}