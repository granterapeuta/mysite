// assets/js/accessibility/features/reading-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class ReadingManager extends BaseFeatureManager {
    constructor(logger) {
        super('reading', logger);
        this.originalTheme = null;
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3,
            theme: 'sepia',
            contrast: 1.1,
            brightness: 0.9
        };
    }

    async setupEventListeners() {
        this.setupToggle('reading-mode-toggle', (e) => {
            this.toggleIntensityControl('reading-intensity-control', e.target.checked);
        });

        this.setupSlider('reading-intensity', 'intensity', (e) => {
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        this.logger.debug('Event listeners de Reading-Mode configurados');
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            root.setAttribute('data-reading-mode', 'true');
            root.setAttribute('data-reading-intensity', this.settings.intensity.toString());
            this.applyReadingTheme();
            this.logger.info('Modo lectura activado', {
                intensity: this.settings.intensity,
                theme: this.settings.theme
            });
        } else {
            root.removeAttribute('data-reading-mode');
            root.removeAttribute('data-reading-intensity');
            this.removeReadingTheme();
            this.logger.info('Modo lectura desactivado');
        }
    }

    applyReadingTheme() {
        const root = document.documentElement;
        // Remover temas previos
        root.classList.remove('reading-theme-sepia', 'reading-theme-dark', 'reading-theme-light');

        // Aplicar tema actual
        if (this.settings.theme) {
            root.classList.add(`reading-theme-${this.settings.theme}`);
        }
    }

    removeReadingTheme() {
        const root = document.documentElement;
        root.classList.remove('reading-theme-sepia', 'reading-theme-dark', 'reading-theme-light');
    }

    setReadingTheme(theme) {
        const validThemes = ['sepia', 'dark', 'light'];
        if (validThemes.includes(theme)) {
            this.settings.theme = theme;
            if (this.settings.enabled) {
                this.applyReadingTheme();
                this.saveSettings();
            }
            this.logger.info('Tema de lectura actualizado', { theme });
        } else {
            this.logger.warn('Tema de lectura no válido', { theme, validThemes });
        }
    }
}