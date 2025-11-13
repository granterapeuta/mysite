// assets/js/accessibility/core/accessibility-manager.js

import { MotionManager } from '../features/motion-manager.js';
import { PhotophobiaManager } from '../features/photophobia-manager.js';
import { DyslexiaManager } from '../features/dyslexia-manager.js';
import { ReadingManager } from '../features/reading-manager.js';
import { FontManager } from '../features/font-manager.js';
import { AccessibilityLogger } from './accessibility-logger.js';

export class AccessibilityManager {
    constructor() {
        if (window.__accessibilityManagerInstance) {
            return window.__accessibilityManagerInstance;
        }
        window.__accessibilityManagerInstance = this;

        this.logger = new AccessibilityLogger('AccessibilityManager');
        this.managers = new Map();
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    async initialize() {
        if (this.isInitialized) {
            this.logger.debug('Ya inicializado, omitiendo...');
            return;
        }

        if (this.initializationPromise) {
            this.logger.debug('Inicialización en progreso, esperando...');
            return this.initializationPromise;
        }

        this.initializationPromise = this._initialize();
        return this.initializationPromise;
    }

    async _initialize() {
        try {
            this.logger.info('Inicializando AccessibilityManager...');
            this.debugAccessibilityElements();
            await this.initializeManagers();
            this.setupInterManagerCommunication();
            this.isInitialized = true;
            this.logger.success('AccessibilityManager inicializado correctamente');
            this.exposeGlobalAPI();
        } catch (error) {
            this.logger.error('Error inicializando AccessibilityManager', error);
            this.initializationPromise = null;
            throw error;
        }
    }

    async initializeManagers() {
        const managerConfigs = [
            { key: 'motion', Class: MotionManager },
            { key: 'photophobia', Class: PhotophobiaManager },
            { key: 'dyslexia', Class: DyslexiaManager },
            { key: 'reading', Class: ReadingManager },
            { key: 'font', Class: FontManager }
        ];

        const initialized = [];

        for (const config of managerConfigs) {
            try {
                if (this.managers.has(config.key)) {
                    this.logger.warn(`Manager ${config.key} ya existe, omitiendo...`);
                    continue;
                }

                if (!this.shouldInitializeManager(config.key)) {
                    this.logger.warn(`Manager ${config.key} omitido - elementos no encontrados`);
                    continue;
                }

                const manager = new config.Class(this.logger);
                await manager.initialize();
                this.managers.set(config.key, manager);
                initialized.push(config.key);
                this.logger.success(`${config.key}Manager inicializado`);

            } catch (error) {
                this.logger.error(`Error inicializando ${config.key}Manager`, error);
            }
        }

        this.logger.info(`Managers inicializados: ${initialized.join(', ')}`);
    }

    shouldInitializeManager(managerKey) {
        const requiredElements = {
            motion: ['reduced-motion-toggle', 'motion-intensity', 'motion-intensity-control'],
            dyslexia: ['dyslexia-mode-toggle', 'dyslexia-intensity', 'dyslexia-intensity-control'],
            reading: ['reading-mode-toggle', 'reading-intensity', 'reading-intensity-control'],
            font: ['font-size-toggle', 'font-size', 'font-size-control'],
            photophobia: ['photophobia-mode-toggle', 'color-temperature', 'brightness', 'refresh-rate', 'photophobia-controls']
        };

        const elements = requiredElements[managerKey] || [];
        const allExist = elements.every(id => {
            const exists = !!document.getElementById(id);
            if (!exists) {
                this.logger.debug(`Elemento no encontrado: ${id}`);
            }
            return exists;
        });

        return allExist;
    }

    debugAccessibilityElements() {
        const allElements = [
            'reduced-motion-toggle', 'motion-intensity', 'motion-intensity-control',
            'dyslexia-mode-toggle', 'dyslexia-intensity', 'dyslexia-intensity-control',
            'reading-mode-toggle', 'reading-intensity', 'reading-intensity-control',
            'font-size-toggle', 'font-size', 'font-size-control',
            'photophobia-mode-toggle', 'color-temperature', 'brightness', 'refresh-rate', 'photophobia-controls'
        ];

        this.logger.info('=== DEBUG: Elementos de Accesibilidad ===');
        allElements.forEach(id => {
            const element = document.getElementById(id);
            this.logger.debug(`- ${id}:`, element ? '✅' : '❌');
        });
        this.logger.info('=== FIN DEBUG ===');
    }

    setupInterManagerCommunication() {
        const readingManager = this.managers.get('reading');
        if (readingManager) {
            readingManager.onEnable = () => {
                const photophobiaManager = this.managers.get('photophobia');
                if (photophobiaManager?.settings.enabled) {
                    photophobiaManager.disable();
                    this.logger.info('Fotofobia desactivada automáticamente al activar modo lectura');
                }
            };
        }

        const photophobiaManager = this.managers.get('photophobia');
        if (photophobiaManager) {
            photophobiaManager.onEnable = () => {
                const motionManager = this.managers.get('motion');
                if (motionManager && !motionManager.settings.enabled) {
                    motionManager.enable(2);
                    this.logger.info('Movimiento reducido activado automáticamente con fotofobia');
                }
            };
        }
    }

    // ... (el resto de los métodos permanecen igual)
    exposeGlobalAPI() {
        window.accessibilityAPI = {
            enable: (feature, intensity) => this.enableFeature(feature, intensity),
            disable: (feature) => this.disableFeature(feature),
            toggle: (feature) => this.toggleFeature(feature),
            getStatus: () => this.getStatus(),
            getFeatureStatus: (feature) => this.getFeatureStatus(feature),
            setIntensity: (feature, intensity) => this.setFeatureIntensity(feature, intensity),
            getLogs: () => this.logger.getRecentLogs(),
            getErrors: () => this.logger.getErrors(),
            generateReport: () => this.logger.generateReport(),
            exportLogs: (format) => this.logger.exportLogs(format),
            version: '1.0.0',
            initialized: this.isInitialized
        };

        this.logger.info('API de accesibilidad expuesta globalmente');
    }

    enableFeature(feature, intensity = null) {
        const manager = this.managers.get(feature);
        if (manager) {
            manager.enable(intensity);
            return true;
        }
        this.logger.warn(`Manager no encontrado para feature: ${feature}`);
        return false;
    }

    disableFeature(feature) {
        const manager = this.managers.get(feature);
        if (manager) {
            manager.disable();
            return true;
        }
        this.logger.warn(`Manager no encontrado para feature: ${feature}`);
        return false;
    }

    toggleFeature(feature) {
        const manager = this.managers.get(feature);
        if (manager) {
            if (manager.settings.enabled) {
                manager.disable();
            } else {
                manager.enable();
            }
            return true;
        }
        return false;
    }

    setFeatureIntensity(feature, intensity) {
        const manager = this.managers.get(feature);
        if (manager) {
            manager.setIntensity(intensity);
            return true;
        }
        return false;
    }

    getFeatureStatus(feature) {
        const manager = this.managers.get(feature);
        return manager ? manager.getStatus() : null;
    }

    getStatus() {
        const status = {};
        for (const [key, manager] of this.managers) {
            status[key] = manager.getStatus();
        }
        return {
            initialized: this.isInitialized,
            features: status,
            logs: {
                total: this.logger.logs.length,
                errors: this.logger.getErrors().length,
                warnings: this.logger.getWarnings().length
            }
        };
    }

    getAllManagers() {
        return this.managers;
    }

    getLogger() {
        return this.logger;
    }

    resetAll() {
        for (const manager of this.managers.values()) {
            manager.disable();
        }
        this.logger.info('Todos los features de accesibilidad reseteados');
    }

    async migrateFromOldSettings() {
        const oldSettings = localStorage.getItem('accessibilitySettings');
        if (oldSettings) {
            try {
                const settings = JSON.parse(oldSettings);
                this.logger.info('Migrando configuraciones antiguas', settings);

                if (settings.reducedMotion !== undefined) {
                    this.enableFeature('motion', settings.motionIntensity || 3);
                }
                if (settings.dyslexiaMode !== undefined) {
                    this.enableFeature('dyslexia', settings.dyslexiaIntensity || 3);
                }
                if (settings.readingMode !== undefined) {
                    this.enableFeature('reading', settings.readingIntensity || 3);
                }
                if (settings.photophobiaMode !== undefined) {
                    this.enableFeature('photophobia');
                }
                if (settings.fontSizeEnabled !== undefined) {
                    this.enableFeature('font', settings.fontSize || 3);
                }

                localStorage.removeItem('accessibilitySettings');
                this.logger.success('Migración de configuraciones completada');

            } catch (error) {
                this.logger.error('Error en migración de configuraciones', error);
            }
        }
    }
}