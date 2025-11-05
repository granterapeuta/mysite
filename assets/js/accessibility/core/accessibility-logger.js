// assets/js/accessibility/core/accessibility-logger.js

export class AccessibilityLogger {
    constructor(name = 'Anonymous') {
        this.name = name;
        this.logs = [];
        this.maxLogs = 1000;
        this.enableRemoteLogging = false;
        this.remoteEndpoint = '/api/logs/accessibility';
    }

    // Niveles de log
    levels = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message: `[${this.name}] ${message}`,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            theme: document.documentElement.getAttribute('data-theme') || 'light'
        };

        // Guardar en memoria
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Guardar en localStorage para persistencia
        this.saveToStorage(logEntry);

        // Enviar a servidor si está habilitado
        if (this.enableRemoteLogging) {
            this.sendToServer(logEntry);
        }

        // Console output
        this.consoleOutput(level, message, data, timestamp);

        return logEntry;
    }

    error(message, data = null) {
        return this.log(this.levels.ERROR, message, data);
    }

    warn(message, data = null) {
        return this.log(this.levels.WARN, message, data);
    }

    info(message, data = null) {
        return this.log(this.levels.INFO, message, data);
    }

    debug(message, data = null) {
        return this.log(this.levels.DEBUG, message, data);
    }

    success(message, data = null) {
        const entry = this.log(this.levels.INFO, `✅ ${message}`, data);
        console.log(`%c[${this.name}] ✅ ${message}`, 'color: green; font-weight: bold;', data || '');
        return entry;
    }

    consoleOutput(level, message, data, timestamp) {
        const time = timestamp.split('T')[1].split('.')[0];
        const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
        const levelName = levelNames[level];

        const styles = {
            ERROR: 'color: red; font-weight: bold;',
            WARN: 'color: orange; font-weight: bold;',
            INFO: 'color: blue;',
            DEBUG: 'color: gray;'
        };

        console.log(`%c[${time}] [${this.name}] ${levelName}: ${message}`, styles[levelName], data || '');
    }

    saveToStorage(logEntry) {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('accessibility_logs') || '[]');
            storedLogs.push(logEntry);

            if (storedLogs.length > 500) {
                storedLogs.splice(0, storedLogs.length - 500);
            }

            localStorage.setItem('accessibility_logs', JSON.stringify(storedLogs));
        } catch (error) {
            console.warn('No se pudieron guardar los logs en localStorage:', error);
        }
    }

    async sendToServer(logEntry) {
        if (!this.enableRemoteLogging) return;

        try {
            await fetch(this.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.warn('No se pudo enviar el log al servidor:', error);
        }
    }

    // Métodos de análisis
    getErrors() {
        return this.logs.filter(log => log.level === this.levels.ERROR);
    }

    getWarnings() {
        return this.logs.filter(log => log.level === this.levels.WARN);
    }

    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }

    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }

    analyzeCommonErrors() {
        const errors = this.getErrors();
        const errorCounts = {};

        errors.forEach(error => {
            const key = error.message;
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });

        return Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([message, count]) => ({ message, count }));
    }

    generateReport() {
        const errors = this.getErrors();
        const warnings = this.getWarnings();
        const commonErrors = this.analyzeCommonErrors();

        return {
            summary: {
                totalLogs: this.logs.length,
                errors: errors.length,
                warnings: warnings.length,
                sessionStart: this.logs[0]?.timestamp,
                sessionEnd: this.logs[this.logs.length - 1]?.timestamp
            },
            commonErrors,
            recentIssues: this.getRecentLogs(20),
            suggestions: this.generateSuggestions()
        };
    }

    generateSuggestions() {
        const errors = this.getErrors();
        const suggestions = new Map(); // Usar Map para evitar duplicados

        errors.forEach(error => {
            if (error.message.includes('Cannot read properties') || error.message.includes('undefined')) {
                suggestions.set('undefined-property', {
                    issue: 'Error de propiedades undefined',
                    solution: 'Verificar que los elementos DOM existen antes de acceder a sus propiedades',
                    codeExample: 'if (element) { element.property }'
                });
            }

            if (error.message.includes('Theme') || error.message.includes('theme')) {
                suggestions.set('theme-error', {
                    issue: 'Problema con temas',
                    solution: 'Verificar que themeManager esté inicializado antes de usar temas',
                    codeExample: 'if (window.themeManager) { themeManager.setTheme() }'
                });
            }

            if (error.message.includes('Particles') || error.message.includes('particle')) {
                suggestions.set('particle-error', {
                    issue: 'Problema con partículas',
                    solution: 'Verificar que el canvas existe y el sistema de partículas esté inicializado',
                    codeExample: 'if (window.particleSystem) { particleSystem.restart() }'
                });
            }

            if (error.message.includes('localStorage') || error.message.includes('storage')) {
                suggestions.set('storage-error', {
                    issue: 'Problema con almacenamiento',
                    solution: 'Verificar que localStorage esté disponible y no esté lleno',
                    codeExample: 'if (StorageUtils.isAvailable()) { /* usar storage */ }'
                });
            }
        });

        return Array.from(suggestions.values());
    }

    // Exportar logs
    exportLogs(format = 'json') {
        const report = this.generateReport();

        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'csv':
                return this.convertToCSV();
            case 'html':
                return this.convertToHTML(report);
            default:
                return report;
        }
    }

    convertToCSV() {
        let csv = 'Timestamp,Level,Message,Data\n';
        this.logs.forEach(log => {
            const dataStr = log.data ? JSON.stringify(log.data).replace(/"/g, '""') : '';
            csv += `"${log.timestamp}","${log.level}","${log.message.replace(/"/g, '""')}","${dataStr}"\n`;
        });
        return csv;
    }

    convertToHTML(report) {
        const levelToClass = {
            0: 'error',
            1: 'warn',
            2: 'info',
            3: 'debug'
        };

        const recentLogsHTML = this.getRecentLogs(20).map(log => `
            <tr class="${levelToClass[log.level]}">
                <td>${log.timestamp}</td>
                <td>${log.level}</td>
                <td>${log.message}</td>
                <td>${log.data ? JSON.stringify(log.data) : ''}</td>
            </tr>
        `).join('');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Accessibility Log Report - ${this.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .error { color: red; background-color: #ffeeee; }
                .warn { color: orange; background-color: #fff4e6; }
                .info { color: blue; background-color: #e6f3ff; }
                .debug { color: gray; background-color: #f5f5f5; }
                table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .suggestion { background: #e8f5e8; padding: 10px; margin: 10px 0; border-left: 4px solid #4CAF50; }
            </style>
        </head>
        <body>
            <h1>Accessibility System Report - ${this.name}</h1>
            
            <div class="summary">
                <h2>Summary</h2>
                <p><strong>Total Logs:</strong> ${report.summary.totalLogs}</p>
                <p><strong>Errors:</strong> ${report.summary.errors}</p>
                <p><strong>Warnings:</strong> ${report.summary.warnings}</p>
                <p><strong>Session Start:</strong> ${report.summary.sessionStart || 'N/A'}</p>
                <p><strong>Session End:</strong> ${report.summary.sessionEnd || 'N/A'}</p>
            </div>

            <div>
                <h2>Common Errors (Top 10)</h2>
                <ul>
                    ${report.commonErrors.map(error =>
            `<li><strong>${error.count}x:</strong> ${error.message}</li>`
        ).join('')}
                </ul>
            </div>

            <div>
                <h2>Suggestions</h2>
                ${report.suggestions.map(suggestion => `
                    <div class="suggestion">
                        <h3>${suggestion.issue}</h3>
                        <p><strong>Solution:</strong> ${suggestion.solution}</p>
                        <p><strong>Code Example:</strong> <code>${suggestion.codeExample}</code></p>
                    </div>
                `).join('')}
            </div>

            <div>
                <h2>Recent Logs (Last 20)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Level</th>
                            <th>Message</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentLogsHTML}
                    </tbody>
                </table>
            </div>
        </body>
        </html>`;
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('accessibility_logs');
    }

    // Método para configurar logging remoto
    enableRemoteLogging(endpoint = null) {
        this.enableRemoteLogging = true;
        if (endpoint) {
            this.remoteEndpoint = endpoint;
        }
    }

    disableRemoteLogging() {
        this.enableRemoteLogging = false;
    }
}