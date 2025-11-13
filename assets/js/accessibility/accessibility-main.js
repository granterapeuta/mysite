// assets/js/accessibility/accessibility-main.js

// Punto de entrada principal del sistema de accesibilidad
import { AccessibilityManager } from './core/accessibility-manager.js';

class AccessibilitySystem {
    constructor() {
        this.manager = null;
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    async initialize() {
        // Prevenir múltiples inicializaciones
        if (this.isInitialized) {
            console.log('♿ Sistema de accesibilidad ya inicializado');
            return;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._initialize();
        return this.initializationPromise;
    }

    async _initialize() {
        try {
            console.log('♿ Inicializando sistema de accesibilidad...');

            // Esperar a que el DOM esté listo si no lo está
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            this.manager = new AccessibilityManager();
            await this.manager.initialize();

            // Migrar configuraciones antiguas si existen
            await this.manager.migrateFromOldSettings();

            this.isInitialized = true;
            console.log('✅ Sistema de accesibilidad completamente inicializado');

            // Exponer para debugging
            window.accessibilitySystem = this;

            // Disparar evento personalizado
            this.dispatchInitializedEvent();

        } catch (error) {
            console.error('❌ Error crítico inicializando sistema de accesibilidad:', error);
            this.initializationPromise = null;
            throw error;
        }
    }

    dispatchInitializedEvent() {
        const event = new CustomEvent('accessibilitySystem:initialized', {
            detail: {
                system: this,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    // Métodos de conveniencia
    enable(feature, intensity) {
        if (!this.isInitialized) {
            console.warn('Sistema de accesibilidad no inicializado');
            return false;
        }
        return this.manager?.enableFeature(feature, intensity);
    }

    disable(feature) {
        if (!this.isInitialized) {
            console.warn('Sistema de accesibilidad no inicializado');
            return false;
        }
        return this.manager?.disableFeature(feature);
    }

    status() {
        return this.manager?.getStatus();
    }

    // Método para verificar estado
    isReady() {
        return this.isInitialized;
    }
}

// Crear instancia única
const accessibilitySystem = new AccessibilitySystem();

// Inicialización automática cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        accessibilitySystem.initialize().catch(console.error);
    });
} else {
    // DOM ya está listo
    accessibilitySystem.initialize().catch(console.error);
}

// Exportar para uso modular
export { accessibilitySystem };
export default accessibilitySystem;