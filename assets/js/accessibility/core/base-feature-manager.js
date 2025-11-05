// assets/js/accessibility/core/base-feature-manager.js

export class BaseFeatureManager {
    constructor(name, logger) {
        this.name = name;
        this.logger = logger;
        this.settings = this.getDefaultSettings();
        this.isInitialized = false;
    }

    loadSettings() {
        try {
            const allSettings = JSON.parse(localStorage.getItem('accessibility_settings') || '{}');
            const savedSettings = allSettings[this.name];

            if (savedSettings) {
                this.settings = {
                    ...this.getDefaultSettings(),
                    ...savedSettings
                };
                this.logger.debug(`Configuración cargada para ${this.name}`, this.settings);
            } else {
                this.logger.debug(`Configuración por defecto para ${this.name}`, this.settings);
            }
        } catch (error) {
            this.logger.error(`Error cargando configuración para ${this.name}`, error);
            this.settings = this.getDefaultSettings();
        }
    }

    saveSettings() {
        try {
            const allSettings = JSON.parse(localStorage.getItem('accessibility_settings') || '{}');
            allSettings[this.name] = this.settings;
            localStorage.setItem('accessibility_settings', JSON.stringify(allSettings));
            this.logger.debug(`Configuración guardada para ${this.name}`, this.settings);
        } catch (error) {
            this.logger.error(`Error guardando configuración para ${this.name}`, error);
        }
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3
        };
    }

    getStatus() {
        return {
            name: this.name,
            enabled: this.settings.enabled || false,
            settings: this.settings,
            initialized: this.isInitialized
        };
    }

    async initialize() {
        try {
            this.loadSettings();
            await this.setupEventListeners();
            this.applySettings();
            this.isInitialized = true;
            this.logger.success(`${this.name} inicializado correctamente`);
        } catch (error) {
            this.logger.error(`Error inicializando ${this.name}`, error);
            throw error;
        }
    }

    enable(intensity = null) {
        this.settings.enabled = true;
        if (intensity !== null) {
            this.settings.intensity = this.validateIntensity(intensity);
        }
        this.applySettings();
        this.saveSettings();
        this.logger.info(`${this.name} activado`, { intensity: this.settings.intensity });
    }

    disable() {
        this.settings.enabled = false;
        this.applySettings();
        this.saveSettings();
        this.logger.info(`${this.name} desactivado`);
    }

    setIntensity(intensity) {
        this.settings.intensity = this.validateIntensity(intensity);
        if (this.settings.enabled) {
            this.applySettings();
            this.saveSettings();
        }
        this.logger.debug(`Intensidad de ${this.name} actualizada`, { intensity: this.settings.intensity });
    }

    validateIntensity(intensity, min = 1, max = 5) {
        const parsed = parseInt(intensity);
        return Math.min(max, Math.max(min, isNaN(parsed) ? min : parsed));
    }

    // Métodos que deben ser implementados por las clases hijas
    async setupEventListeners() {
        throw new Error('Método setupEventListeners debe ser implementado');
    }

    applySettings() {
        throw new Error('Método applySettings debe ser implementado');
    }

    // Métodos utilitarios comunes
    setupToggle(toggleId, onChange = null) {
        const toggle = document.getElementById(toggleId);
        if (!toggle) {
            this.logger.warn(`Toggle no encontrado: ${toggleId}`);
            return false;
        }

        toggle.checked = this.settings.enabled;
        toggle.addEventListener('change', (e) => {
            this.settings.enabled = e.target.checked;

            // Ejecutar callbacks de habilitación/deshabilitación
            if (e.target.checked) {
                this.onEnable?.();
            } else {
                this.onDisable?.();
            }

            onChange?.(e);
            this.applySettings();
            this.saveSettings();
        });

        // Aplicar estado inicial
        if (this.settings.enabled) {
            this.onEnable?.();
        }

        return true;
    }

    setupSlider(sliderId, settingKey = 'intensity', onChange = null) {
        const slider = document.getElementById(sliderId);
        if (!slider) {
            this.logger.warn(`Slider no encontrado: ${sliderId}`);
            return false;
        }

        const valueDisplay = this.findValueDisplay(slider);
        if (!valueDisplay) {
            this.logger.warn(`Display de valor no encontrado para slider: ${sliderId}`);
            return false;
        }

        const currentValue = this.settings[settingKey] ?? this.settings.intensity;
        slider.value = currentValue;
        valueDisplay.textContent = currentValue;

        slider.addEventListener('input', (e) => {
            const newValue = parseInt(e.target.value);
            this.settings[settingKey] = newValue;
            valueDisplay.textContent = newValue;

            onChange?.(e);
            this.applySettings();
            this.saveSettings();
        });

        this.logger.debug(`Slider configurado: ${sliderId}`);
        return true;
    }

    findValueDisplay(slider) {
        // Buscar en diferentes estructuras de contenedores
        const containers = ['.intensity-control', '.slider-container'];
        for (const containerClass of containers) {
            const container = slider.closest(containerClass);
            const valueDisplay = container?.querySelector('.intensity-value, .slider-value');
            if (valueDisplay) return valueDisplay;
        }

        // Buscar en elementos hermanos
        return slider.nextElementSibling?.classList?.contains('intensity-value') ||
        slider.nextElementSibling?.classList?.contains('slider-value')
            ? slider.nextElementSibling
            : null;
    }

    toggleElementVisibility(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
            return true;
        }
        return false;
    }

    toggleIntensityControl(controlId, show) {
        const control = document.getElementById(controlId);
        if (!control) return false;

        if (show) {
            control.classList.add('visible');
            control.style.display = control.classList.contains('intensity-control') ? 'flex' : 'block';
        } else {
            control.classList.remove('visible');
            control.style.display = 'none';
        }
        return true;
    }
}