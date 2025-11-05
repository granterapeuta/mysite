// assets/js/components/particles/particle-system.js

import { Logger } from '../../core/logger.js';
import { eventBus } from '../../core/event-bus.js';

export class ParticleSystem {
    constructor(canvasId) {
        this.logger = new Logger('ParticleSystem');
        this.canvas = document.getElementById(canvasId);

        if (!this.canvas) {
            this.logger.error('Canvas no encontrado', { canvasId });
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isInitialized = false;
        this.currentTheme = 'light';

        this.config = {
            count: 60,
            colors: this.getParticleColors(),
            sizeMin: 1,
            sizeMax: 2.5,
            speed: 0.5,
            opacity: 0.4,
            moveSpeed: 1
        };

        this.logger.success('Sistema creado');
        this.init();
    }

    init() {
        this.setupCanvas();
        this.createParticles();
        this.startAnimation();
        this.isInitialized = true;

        this.setupEventListeners();
        this.verifyMethods(); 
        this.logger.success('Inicializado', { theme: this.currentTheme });
    }

    getCSSVariable(name, defaultValue) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name);
        return value ? parseFloat(value.trim()) : defaultValue;
    }

    getParticleColors() {
        const colorsArray = getComputedStyle(document.documentElement).getPropertyValue('--particles-colors-array');
        if (colorsArray) {
            try {
                const cleanArray = colorsArray.trim().replace(/^\[|\]$/g, '');
                return JSON.parse(`[${cleanArray}]`);
            } catch (e) {
                this.logger.warn('No se pudieron parsear colores CSS, usando defaults');
            }
        }

        return [
            'rgba(100, 200, 255, 0.2)',
            'rgba(120, 180, 240, 0.15)',
            'rgba(140, 220, 255, 0.18)',
            'rgba(160, 230, 255, 0.12)',
            'rgba(180, 240, 255, 0.1)'
        ];
    }
    
    setReducedOpacity(opacity) {
        this.particles.forEach(particle => {
            // Convertir rgba string a nuevo valor de opacidad
            const newColor = particle.color.replace(/rgba\(([^,]+,[^,]+,[^,]+),([^)]+)\)/,
                `rgba($1,${opacity})`);
            particle.color = newColor;
        });
        this.logger.debug(`Opacidad de partículas reducida a ${opacity}`);
    }

    setNormalOpacity() {
        // Restaurar colores originales
        this.particles.forEach((particle, index) => {
            particle.color = particle.originalColor;
        });
        this.logger.debug('Opacidad de partículas restaurada');
    }
    
    setupCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            opacity: ${this.config.opacity};
        `;

        this.logger.debug('Canvas configurado', { width, height });
    }

    createParticles() {
        this.particles = [];
        this.updateConfigFromCSS();

        for (let i = 0; i < this.config.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * (this.config.sizeMax - this.config.sizeMin) + this.config.sizeMin,
                speedX: (Math.random() - 0.5) * this.config.speed * this.config.moveSpeed,
                speedY: (Math.random() - 0.5) * this.config.speed * this.config.moveSpeed,
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                originalColor: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
            });
        }

        this.logger.debug(`${this.particles.length} partículas creadas`);
    }

    updateConfigFromCSS() {
        this.config.count = this.getCSSVariable('--particles-count', 60);
        this.config.opacity = this.getCSSVariable('--particles-opacity', 0.4);
        this.config.speed = this.getCSSVariable('--particles-speed', 0.5);
        this.config.moveSpeed = this.getCSSVariable('--particles-move-speed', 1);
        this.config.sizeMin = this.getCSSVariable('--particles-size-min', 1);
        this.config.sizeMax = this.getCSSVariable('--particles-size-max', 2.5);
        this.config.colors = this.getParticleColors();

        if (this.canvas) {
            this.canvas.style.opacity = this.config.opacity;
        }
    }

    updateParticles() {
        const reducedMotion = document.documentElement.hasAttribute('data-reduced-motion');

        this.particles.forEach(particle => {
            if (!reducedMotion) {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Rebote en bordes
                if (particle.x <= 0 || particle.x >= this.canvas.width) {
                    particle.speedX *= -0.95;
                    particle.x = Math.max(1, Math.min(this.canvas.width - 1, particle.x));
                }

                if (particle.y <= 0 || particle.y >= this.canvas.height) {
                    particle.speedY *= -0.95;
                    particle.y = Math.max(1, Math.min(this.canvas.height - 1, particle.y));
                }

                // Movimiento orgánico
                particle.speedX += (Math.random() - 0.5) * 0.01;
                particle.speedY += (Math.random() - 0.5) * 0.01;

                // Limitar velocidad
                const maxSpeed = this.config.speed * 1.5;
                const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
                if (speed > maxSpeed) {
                    particle.speedX = (particle.speedX / speed) * maxSpeed;
                    particle.speedY = (particle.speedY / speed) * maxSpeed;
                }
            }
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    setReducedSpeed(factor) {
        this.particles.forEach(particle => {
            particle.speedX *= factor;
            particle.speedY *= factor;
        });
        this.logger.debug(`Velocidad de partículas reducida a ${factor * 100}%`);
    }

    setNormalSpeed() {
        // Restaurar velocidades originales basadas en configuración
        this.particles.forEach(particle => {
            const originalSpeed = this.config.speed * this.config.moveSpeed;
            const currentSpeed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);

            if (currentSpeed > 0) {
                const factor = originalSpeed / currentSpeed;
                particle.speedX *= factor;
                particle.speedY *= factor;
            }
        });
        this.logger.debug('Velocidad de partículas restaurada');
    }
    
    setLowRefreshRate(enabled) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (enabled) {
            this.animate = () => {
                this.updateParticles();
                this.drawParticles();
                setTimeout(() => {
                    this.animationId = requestAnimationFrame(() => this.animate());
                }, 33);
            };
        } else {
            this.animate = () => {
                this.updateParticles();
                this.drawParticles();
                this.animationId = requestAnimationFrame(() => this.animate());
            };
        }

        this.startAnimation();
        this.logger.debug('Refresh rate actualizado', { lowRefresh: enabled });
    }

    setupEventListeners() {
        // Escuchar cambios de tema
        eventBus.on('theme:changed', (data) => {
            this.onThemeChange(data.theme);
        });

        // Observar cambios en atributos de accesibilidad
        const observer = new MutationObserver(() => {
            this.updateConfigFromCSS();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-reduced-motion', 'data-photophobia-mode']
        });
    }

    onThemeChange(newTheme) {
        this.logger.info('Cambio de tema detectado', { newTheme });
        this.currentTheme = newTheme;

        setTimeout(() => {
            this.updateConfigFromCSS();
            this.createParticles();
        }, 100);
    }

    restart() {
        this.createParticles();
        this.startAnimation();
        this.logger.debug('Sistema reiniciado');
    }

    // Métodos públicos para debugging
    makeBrighter() {
        this.particles.forEach(particle => {
            const newColor = particle.color.replace(/[\d\.]+\)$/g, '0.6)');
            particle.color = newColor;
        });
        this.logger.debug('Partículas hechas más brillantes');
    }

    makeLarger() {
        this.particles.forEach(particle => {
            particle.size *= 1.5;
        });
        this.logger.debug('Partículas agrandadas');
    }

    // Método para verificar que todos los métodos están disponibles
    verifyMethods() {
        const methods = [
            'setReducedSpeed',
            'setReducedOpacity',
            'setNormalSpeed',
            'setNormalOpacity',
            'stopAnimation',
            'startAnimation'
        ];

        const availableMethods = {};
        methods.forEach(method => {
            availableMethods[method] = typeof this[method] === 'function';
        });

        console.log('🔍 ParticleSystem métodos verificados:', availableMethods);
        return availableMethods;
    }
}