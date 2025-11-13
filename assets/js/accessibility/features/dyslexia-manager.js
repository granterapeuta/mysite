// assets/js/accessibility/features/dyslexia-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class DyslexiaManager extends BaseFeatureManager {
    constructor(logger) {
        super('dyslexia', logger);
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3,
            fontFamily: 'OpenDyslexic, Arial, sans-serif',
            letterSpacing: '0.12em',
            wordSpacing: '0.16em',
            lineHeight: '1.6'
        };
    }

    async setupEventListeners() {
        this.setupToggle('dyslexia-mode-toggle', (e) => {
            this.toggleIntensityControl('dyslexia-intensity-control', e.target.checked);
        });

        this.setupSlider('dyslexia-intensity', 'intensity', (e) => {
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        this.logger.debug('Event listeners de dyslexia configurados');
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            root.setAttribute('data-dyslexia-mode', 'true');
            root.setAttribute('data-dyslexia-intensity', this.settings.intensity.toString());
            this.logger.info('Modo dislexia activado', {
                intensity: this.settings.intensity
            });
        } else {
            root.removeAttribute('data-dyslexia-mode');
            root.removeAttribute('data-dyslexia-intensity');
            this.logger.info('Modo dislexia desactivado');
        }
    }
}