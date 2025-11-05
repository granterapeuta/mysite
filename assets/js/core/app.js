// assets/js/core/app.js

import { Logger } from './logger.js';
import { eventBus } from './event-bus.js';
import { NavigationManager } from '../components/navigation/navigation-manager.js';
import { ThemeManager } from '../components/themes/theme-manager.js';
import { ParticleSystem } from '../components/particles/particle-system.js';
import { FooterManager } from '../components/ui/footer-manager.js';

class App {
    constructor() {
        this.logger = new Logger('App');
        this.modules = new Map();
        this.isInitialized = false;

        this.init();
    }

    async init() {
        try {
            this.logger.info('Inicializando aplicación...');

            // Inicializar módulos en orden
            await this.initializeModules();

            this.setupGlobalAPI();
            this.isInitialized = true;

            this.logger.success('Aplicación inicializada correctamente');

        } catch (error) {
            this.logger.error('Error inicializando aplicación', error);
        }
    }

    async initializeModules() {
        const moduleConfigs = [
            {
                name: 'navigation',
                Class: NavigationManager,
                condition: () => true
            },
            {
                name: 'theme',
                Class: ThemeManager,
                condition: () => true
            },
            {
                name: 'particles',
                Class: ParticleSystem,
                condition: () => document.getElementById('particles-canvas'),
                args: ['particles-canvas']
            },
            {
                name: 'footer',
                Class: FooterManager,
                condition: () => document.querySelector('footer')
            }
        ];

        for (const config of moduleConfigs) {
            if (config.condition()) {
                try {
                    const args = config.args || [];
                    const instance = new config.Class(...args);
                    this.modules.set(config.name, instance);
                    this.logger.success(`${config.name} inicializado`);

                    // Exponer particleSystem globalmente inmediatamente después de inicializar
                    if (config.name === 'particles') {
                        window.particleSystem = instance;
                        this.logger.debug('ParticleSystem expuesto globalmente');
                    }
                } catch (error) {
                    this.logger.error(`Error inicializando ${config.name}`, error);
                }
            } else {
                this.logger.debug(`${config.name} no se inicializó (condición no cumplida)`);
            }
        }
    }

    setupGlobalAPI() {
        window.app = {
            // Acceso a módulos
            getModule: (name) => this.modules.get(name),
            getModules: () => Array.from(this.modules.keys()),

            // Estado
            getStatus: () => ({
                initialized: this.isInitialized,
                modules: Array.from(this.modules.keys()),
                version: '1.0.0'
            }),

            // Utilidades
            logger: this.logger,
            eventBus: eventBus
        };

        // Comandos de debug
        console.log('🚀 App Comandos:');
        console.log('- app.getModule("theme")');
        console.log('- app.getStatus()');
        console.log('- app.eventBus.emit("theme:change", {theme: "dark"})');
    }

    // Métodos públicos
    getModule(name) {
        return this.modules.get(name);
    }

    restartModule(name) {
        const module = this.modules.get(name);
        if (module && module.restart) {
            module.restart();
            this.logger.info(`Módulo ${name} reiniciado`);
            return true;
        }
        return false;
    }
}

// Inicialización
const app = new App();

// Exportar para uso modular
export { app };
export default app;