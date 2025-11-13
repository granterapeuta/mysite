// assets/js/accessibility/features/photophobia-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class PhotophobiaManager extends BaseFeatureManager {
    constructor(logger) {
        super('photophobia', logger);
    }

    getDefaultSettings() {
        return {
            enabled: false,
            colorTemperature: 5,
            brightness: 5,
            refreshRate: 7
        };
    }

    async setupEventListeners() {
        this.setupToggle('photophobia-mode-toggle', (e) => {
            this.toggleIntensityControl('photophobia-controls', e.target.checked);
        });

        this.setupSlider('color-temperature', 'colorTemperature');
        this.setupSlider('brightness', 'brightness');
        this.setupSlider('refresh-rate', 'refreshRate');

        this.logger.debug('Event listeners de photophobia configurados');
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            root.setAttribute('data-photophobia-mode', 'true');
            this.applyCustomFilters();
            this.applyRefreshRateEffects();
            this.logger.info('Modo fotofobia activado', this.settings);
        } else {
            root.removeAttribute('data-photophobia-mode');
            this.removeCustomFilters();
            this.removeRefreshRateEffects();
            this.logger.info('Modo fotofobia desactivado');
        }
    }

    applyCustomFilters() {
        const filters = [];

        // Temperatura de color (0=frio, 10=calido)
        const tempValue = (this.settings.colorTemperature - 5) * 12;
        if (tempValue !== 0) {
            filters.push(`hue-rotate(${tempValue}deg)`);
        }

        // Brillo (0=oscuro, 10=brillante)
        const brightnessValue = 0.7 + (this.settings.brightness * 0.03);
        if (brightnessValue !== 1.0) {
            filters.push(`brightness(${brightnessValue})`);
        }

        // Aplicar filtros
        if (filters.length > 0) {
            document.body.style.filter = filters.join(' ');
        } else {
            document.body.style.filter = '';
        }
    }

    applyRefreshRateEffects() {
        const root = document.documentElement;
        this.removeRefreshRateEffects();

        if (this.settings.enabled) {
            root.setAttribute('data-refresh-rate', this.settings.refreshRate.toString());
            const levelInfo = this.getRefreshRateLevelInfo(this.settings.refreshRate);
            this.logger.debug('Refresh rate aplicado', {
                level: this.settings.refreshRate,
                description: levelInfo.description
            });
        }
    }

    removeRefreshRateEffects() {
        const root = document.documentElement;
        root.removeAttribute('data-refresh-rate');
    }

    removeCustomFilters() {
        document.body.style.filter = '';
        this.removeRefreshRateEffects();
    }

    getRefreshRateLevelInfo(level) {
        const levels = {
            0: { description: 'Máxima reducción - Sin animaciones', effects: ['Elimina todas las animaciones'] },
            1: { description: 'Reducción extrema - Mínimo movimiento', effects: ['Animaciones casi eliminadas'] },
            2: { description: 'Reducción crítica - Movimiento muy limitado', effects: ['Animaciones muy reducidas'] },
            3: { description: 'Reducción alta - Movimiento limitado', effects: ['Animaciones significativamente reducidas'] },
            4: { description: 'Reducción media-alta - Movimiento controlado', effects: ['Animaciones reducidas a 0.1s'] },
            5: { description: 'Reducción media - Movimiento moderado', effects: ['Animaciones a 0.1s'] },
            6: { description: 'Reducción baja - Movimiento suave', effects: ['Animaciones a 0.3s'] },
            7: { description: 'Reducción mínima - Movimiento casi normal', effects: ['Animaciones a 0.5s'] },
            8: { description: 'Casi normal - Movimiento fluido', effects: ['Animaciones normales'] },
            9: { description: 'Normal - Sin restricciones', effects: ['Animaciones completas'] },
            10: { description: 'Máximo - Experiencia completa', effects: ['Sin restricciones'] }
        };

        return levels[level] || levels[7];
    }

    setRefreshRate(rate) {
        this.settings.refreshRate = Math.min(10, Math.max(0, parseInt(rate)));
        if (this.settings.enabled) {
            this.applyRefreshRateEffects();
            this.saveSettings();
        }
        this.logger.info('Refresh rate actualizado', { rate: this.settings.refreshRate });
    }

    getRefreshRateState() {
        return {
            level: this.settings.refreshRate,
            info: this.getRefreshRateLevelInfo(this.settings.refreshRate),
            enabled: this.settings.enabled
        };
    }
}