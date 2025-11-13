// assets/js/accessibility/features/motion-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class MotionManager extends BaseFeatureManager {
    constructor(logger) {
        super('motion', logger);
        this.settings = this.getDefaultSettings();
        this.particleSystemReady = false;
        this.pendingParticleActions = [];
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3,
            reduceParticles: true
        };
    }

    async setupEventListeners() {
        this.setupToggle('reduced-motion-toggle', (e) => {
            this.toggleIntensityControl('motion-intensity-control', e.target.checked);
        });

        this.setupSlider('motion-intensity', 'intensity', (e) => {
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        // Esperar a que el particleSystem esté disponible
        this.waitForParticleSystem();

        this.logger.debug('Event listeners de motion configurados');
    }

    async waitForParticleSystem() {
        // Esperar hasta que particleSystem esté disponible y tenga métodos
        const maxAttempts = 30; // 3 segundos máximo
        const interval = 100;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (this.isParticleSystemReady()) {
                this.particleSystemReady = true;
                this.logger.debug('Sistema de partículas detectado y listo');

                // Ejecutar acciones pendientes
                this.executePendingParticleActions();
                return;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        this.logger.warn('Sistema de partículas no disponible después de espera');
    }

    isParticleSystemReady() {
        if (!window.particleSystem) return false;

        // Verificar que los métodos específicos existan
        const hasRequiredMethods =
            typeof window.particleSystem.setReducedSpeed === 'function' &&
            typeof window.particleSystem.setReducedOpacity === 'function' &&
            typeof window.particleSystem.setNormalSpeed === 'function' &&
            typeof window.particleSystem.setNormalOpacity === 'function' &&
            typeof window.particleSystem.stopAnimation === 'function' &&
            typeof window.particleSystem.startAnimation === 'function';

        return hasRequiredMethods;
    }

    getIntensityLevel() {
        const intensity = this.settings.intensity;
        const levelMap = {
            1: 1, // Reducción leve
            2: 2, // Reducción media  
            3: 2, // Reducción media (valor por defecto)
            4: 3, // Reducción alta
            5: 4  // Sin movimiento
        };
        return levelMap[intensity] || 2;
    }

    getIntensityInfo() {
        const level = this.getIntensityLevel();
        const levelInfo = {
            1: {
                name: 'Leve',
                description: 'Reducción mínima de animaciones',
                effects: ['Animaciones más lentas', 'Transiciones suaves']
            },
            2: {
                name: 'Media',
                description: 'Reducción moderada de movimiento',
                effects: ['Animaciones significativamente reducidas', 'Efectos hover limitados']
            },
            3: {
                name: 'Alta',
                description: 'Reducción extensa de movimiento',
                effects: ['Solo animaciones esenciales', 'Efectos hover eliminados']
            },
            4: {
                name: 'Extrema',
                description: 'Sin movimiento',
                effects: ['Todas las animaciones desactivadas', 'Scroll instantáneo']
            }
        };

        return {
            level: level,
            intensity: this.settings.intensity,
            info: levelInfo[level] || levelInfo[2]
        };
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            const level = this.getIntensityLevel();
            root.setAttribute('data-reduced-motion', level.toString());
            this.applyMotionReduction(level);
            this.logger.info('Movimiento reducido activado', {
                intensity: this.settings.intensity,
                level: level
            });
        } else {
            root.removeAttribute('data-reduced-motion');
            this.removeMotionReduction();
            this.logger.info('Movimiento reducido desactivado');
        }
    }

    applyMotionReduction(level) {
        const root = document.documentElement;
        root.setAttribute('data-reduced-motion', level.toString());
        this.controlParticles(level);
        this.logger.debug(`Reducción de movimiento aplicada - Nivel ${level}`);
    }

    controlParticles(level) {
        this.logger.debug(`Control de partículas solicitado - Nivel ${level}`);

        // Si el particleSystem no está listo, guardar la acción para después
        if (!this.particleSystemReady) {
            this.pendingParticleActions.push(() => this.executeParticleControl(level));
            this.logger.debug('Acción de partículas en cola pendiente');
            return;
        }

        this.executeParticleControl(level);
    }

    executeParticleControl(level) {
        if (!window.particleSystem) {
            this.logger.warn('Sistema de partículas no disponible');
            return;
        }

        try {
            const particleConfigs = {
                1: { speed: 0.7, opacity: 0.8, shouldStop: false },
                2: { speed: 0.4, opacity: 0.5, shouldStop: false },
                3: { speed: 0.2, opacity: 0.3, shouldStop: false },
                4: { speed: 0, opacity: 0, shouldStop: true }
            };

            const config = particleConfigs[level] || particleConfigs[2];

            if (config.shouldStop) {
                window.particleSystem.stopAnimation();
                this.logger.debug('Animación de partículas detenida');
            } else {
                // Asegurarse de que la animación esté corriendo
                if (typeof window.particleSystem.startAnimation === 'function') {
                    window.particleSystem.startAnimation();
                }

                // Aplicar reducción de velocidad y opacidad
                if (typeof window.particleSystem.setReducedSpeed === 'function') {
                    window.particleSystem.setReducedSpeed(config.speed);
                }

                if (typeof window.particleSystem.setReducedOpacity === 'function') {
                    window.particleSystem.setReducedOpacity(config.opacity);
                }

                this.logger.debug(`Partículas configuradas - Velocidad: ${config.speed}, Opacidad: ${config.opacity}`);
            }
        } catch (error) {
            this.logger.error('Error controlando partículas', error);
        }
    }

    executePendingParticleActions() {
        if (this.pendingParticleActions.length > 0) {
            this.logger.debug(`Ejecutando ${this.pendingParticleActions.length} acciones pendientes de partículas`);
            this.pendingParticleActions.forEach(action => action());
            this.pendingParticleActions = [];
        }
    }

    removeMotionReduction() {
        const root = document.documentElement;
        root.removeAttribute('data-reduced-motion');

        if (this.particleSystemReady && window.particleSystem) {
            try {
                // Reanudar animación si estaba detenida
                if (typeof window.particleSystem.startAnimation === 'function') {
                    window.particleSystem.startAnimation();
                }

                // Restaurar configuración normal
                if (typeof window.particleSystem.setNormalSpeed === 'function') {
                    window.particleSystem.setNormalSpeed();
                }

                if (typeof window.particleSystem.setNormalOpacity === 'function') {
                    window.particleSystem.setNormalOpacity();
                }

                this.logger.debug('Configuración de partículas restaurada a normal');
            } catch (error) {
                this.logger.error('Error restaurando partículas', error);
            }
        }

        this.logger.debug('Reducción de movimiento removida');
    }

    // Método para forzar la reconexión con particleSystem
    reconnectParticleSystem() {
        this.particleSystemReady = false;
        this.waitForParticleSystem();
    }
}