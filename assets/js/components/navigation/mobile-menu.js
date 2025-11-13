// assets/js/components/navigation/mobile-menu.js
import { Logger } from '../../core/logger.js';
import { eventBus } from '../../core/event-bus.js';

export class MobileMenu {
    constructor() {
        this.logger = new Logger('MobileMenu');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeToggle = document.getElementById('close-menu-toggle');
        this.menuOverlay = document.getElementById('menu-overlay');

        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;

        if (this.menuToggle && this.mobileMenu) {
            this.setupEventListeners();
            this.isInitialized = true;
            this.logger.success('Inicializado');
        } else {
            this.logger.warn('Elementos del menú móvil no encontrados');
        }
    }

    setupEventListeners() {
        // Toggle del menú
        this.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle(!this.mobileMenu.classList.contains('active'));
        });

        // Botón cerrar
        if (this.closeToggle) {
            this.closeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle(false);
            });
        }

        // Overlay
        if (this.menuOverlay) {
            this.menuOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle(false);
            });
        }

        // Cerrar al hacer clic en enlaces
        if (this.mobileMenu) {
            this.mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.toggle(false);
                });
            });
        }

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.toggle(false);
                if (this.menuToggle) this.menuToggle.focus();
            }
        });

        // Trap focus
        this.setupFocusTrap();
    }

    toggle(show) {
        this.logger.debug(`Toggle menú móvil: ${show}`);

        if (show) {
            this.open();
        } else {
            this.close();
        }

        eventBus.emit('mobilemenu:toggled', { isOpen: show });
    }

    open() {
        this.mobileMenu.classList.add('active');
        if (this.menuOverlay) this.menuOverlay.classList.add('active');
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            if (this.closeToggle) this.closeToggle.focus();
        }, 100);

        this.logger.debug('Menú móvil abierto');
    }

    close() {
        this.mobileMenu.classList.remove('active');
        if (this.menuOverlay) this.menuOverlay.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (this.menuToggle) this.menuToggle.focus();
        this.logger.debug('Menú móvil cerrado');
    }

    isOpen() {
        return this.mobileMenu.classList.contains('active');
    }

    setupFocusTrap() {
        this.mobileMenu.addEventListener('keydown', (e) => {
            if (!this.isOpen()) return;

            const focusableElements = this.mobileMenu.querySelectorAll(
                'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
}