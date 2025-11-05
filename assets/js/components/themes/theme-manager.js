// assets/js/components/themes/theme-manager.js

import { Logger } from '../../core/logger.js';
import { eventBus } from '../../core/event-bus.js';

export class ThemeManager {
    constructor() {
        this.logger = new Logger('ThemeManager');
        this.availableThemes = ['light', 'dark', 'sepia', 'gray-scale', 'high-contrast'];
        this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
        this.particlesEnabled = true;

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeEventListeners();
        this.setupParticleThemes();
        this.logger.success('Inicializado', { theme: this.currentTheme });
    }

    getSavedTheme() {
        return localStorage.getItem('preferred-theme');
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme(theme) {
        if (!this.availableThemes.includes(theme)) {
            theme = 'light';
            this.logger.warn('Tema no válido, usando light por defecto');
        }

        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('preferred-theme', theme);

        this.applyThemeSpecifics(theme);
        this.updateThemeUI(theme);
        this.notifyThemeChange(theme);

        this.logger.info('Tema aplicado', { theme });
    }

    applyThemeSpecifics(theme) {
        const specifics = {
            'high-contrast': {
                particles: false,
                animations: 'reduce'
            },
            'dark': {
                particles: true,
                animations: 'normal'
            },
            'light': {
                particles: true,
                animations: 'normal'
            },
            'sepia': {
                particles: true,
                animations: 'normal'
            }
        };

        const config = specifics[theme] || specifics.light;

        this.particlesEnabled = config.particles;
        this.toggleParticles(config.particles);

        if (config.animations === 'reduce') {
            document.documentElement.style.setProperty('--reduce-motion', 'reduce');
        } else {
            document.documentElement.style.removeProperty('--reduce-motion');
        }
    }

    updateThemeUI(theme) {
        // Actualizar opciones activas en dropdown
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === theme) {
                option.classList.add('active');
            }
        });

        // Actualizar selector móvil
        const mobileSelector = document.getElementById('mobile-theme-selector');
        if (mobileSelector) {
            mobileSelector.value = theme;
        }
    }

    toggleParticles(enabled) {
        const particlesContainer = document.querySelector('.particles-container');
        if (particlesContainer) {
            particlesContainer.style.display = enabled ? 'block' : 'none';
        }

        if (window.particleSystem) {
            if (enabled && !window.particleSystem.isInitialized) {
                window.particleSystem.init();
            }
        }
    }

    setupParticleThemes() {
        const particleThemes = {
            'light': {
                colors: [
                    'rgba(60, 200, 143, 0.15)',
                    'rgba(51, 91, 154, 0.12)',
                    'rgba(87, 196, 220, 0.1)',
                    'rgba(40, 169, 123, 0.12)',
                    'rgba(255, 255, 255, 0.08)',
                    'rgba(200, 220, 255, 0.1)'
                ]
            },
            'dark': {
                colors: [
                    'rgba(60, 200, 143, 0.2)',
                    'rgba(51, 91, 154, 0.18)',
                    'rgba(87, 196, 220, 0.15)',
                    'rgba(40, 169, 123, 0.18)',
                    'rgba(255, 255, 255, 0.12)',
                    'rgba(200, 220, 255, 0.15)'
                ]
            },
            'sepia': {
                colors: [
                    'rgba(139, 109, 66, 0.2)',
                    'rgba(174, 136, 82, 0.18)',
                    'rgba(205, 170, 125, 0.15)',
                    'rgba(160, 120, 70, 0.16)',
                    'rgba(240, 220, 180, 0.12)',
                    'rgba(210, 180, 140, 0.14)'
                ]
            },
            'high-contrast': {
                colors: [
                    'rgba(255, 255, 255, 0.1)',
                    'rgba(255, 255, 255, 0.08)',
                    'rgba(255, 255, 255, 0.06)',
                    'rgba(255, 255, 255, 0.08)',
                    'rgba(255, 255, 255, 0.05)',
                    'rgba(255, 255, 255, 0.07)'
                ]
            }
        };

        window.particleThemes = particleThemes;
    }

    setupThemeEventListeners() {
        // Event listeners para opciones de tema
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = option.getAttribute('data-theme');
                this.applyTheme(theme);
                eventBus.emit('dropdown:close-all');
            });
        });

        // Escuchar cambios del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getSavedTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches && !this.getSavedTheme()) {
                this.applyTheme('high-contrast');
            }
        });

        // Escuchar eventos del bus
        eventBus.on('theme:change', (data) => {
            this.applyTheme(data.theme);
        });
    }

    notifyThemeChange(theme) {
        eventBus.emit('theme:changed', {
            theme,
            particlesEnabled: this.particlesEnabled
        });
    }

    // API pública
    setTheme(theme) {
        this.applyTheme(theme);
    }

    getTheme() {
        return this.currentTheme;
    }

    cycleThemes() {
        const currentIndex = this.availableThemes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.availableThemes.length;
        this.applyTheme(this.availableThemes[nextIndex]);
    }
}