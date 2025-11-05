// assets/js/components/navigation/navigation-manager.js

import { Logger } from '../../core/logger.js';
import { eventBus } from '../../core/event-bus.js';
import { DropdownManager } from './dropdown-manager.js';
import { MobileMenu } from './mobile-menu.js';

export class NavigationManager {
    constructor() {
        this.logger = new Logger('NavigationManager');
        this.dropdownManager = null;
        this.mobileMenu = null;
        this.languageDropdown = document.getElementById('language-dropdown');
        this.themeDropdown = document.getElementById('theme-dropdown');

        this.init();
    }

    init() {
        this.setupManagers();
        this.setupDropdowns();
        this.setupEventListeners();
        this.logger.success('Inicializado');
    }

    setupManagers() {
        // Solo inicializar dropdowns si existen
        if (document.querySelector('.dropdown')) {
            this.dropdownManager = new DropdownManager();
        }

        // Solo inicializar menú móvil si existe
        if (document.getElementById('mobile-menu')) {
            this.mobileMenu = new MobileMenu();
        }
    }

    setupDropdowns() {
        // Configuración específica para dropdowns de navegación
        if (this.languageDropdown) {
            this.setupLanguageDropdown();
        }

        if (this.themeDropdown) {
            this.setupThemeDropdown();
        }
    }

    setupLanguageDropdown() {
        const toggle = this.languageDropdown.querySelector('.dropdown-toggle');
        const menu = this.languageDropdown.querySelector('.dropdown-menu');

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown(this.languageDropdown);
        });

        menu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                this.closeAllDropdowns();
                this.logger.info('Idioma seleccionado', { language: item.textContent });
            });
        });
    }

    setupThemeDropdown() {
        const toggle = this.themeDropdown.querySelector('.dropdown-toggle');
        const menu = this.themeDropdown.querySelector('.dropdown-menu');

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown(this.themeDropdown);
        });

        menu.querySelectorAll('[data-theme]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = item.getAttribute('data-theme');
                this.changeTheme(theme);
                this.closeAllDropdowns();
            });
        });
    }

    toggleDropdown(dropdown) {
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('open');
        this.closeAllDropdowns();

        if (!isOpen) {
            dropdown.classList.add('open');
            dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('open');
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    }

    changeTheme(theme) {
        this.logger.info('Cambiando tema', { theme });
        eventBus.emit('theme:change', { theme });
    }

    setupEventListeners() {
        // Sincronizar selector de tema móvil
        const mobileThemeSelector = document.getElementById('mobile-theme-selector');
        if (mobileThemeSelector) {
            mobileThemeSelector.addEventListener('change', (e) => {
                const theme = e.target.value;
                this.changeTheme(theme);
            });

            // Escuchar cambios de tema para sincronizar
            eventBus.on('theme:changed', (data) => {
                mobileThemeSelector.value = data.theme;
            });
        }

        // Navegación por teclado mejorada
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    handleKeyboardNavigation(e) {
        const dropdown = e.target.closest('.dropdown');
        if (!dropdown || !dropdown.classList.contains('open')) return;

        const items = Array.from(dropdown.querySelectorAll('.dropdown-item'));
        const currentIndex = items.indexOf(e.target);

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex]?.focus();
                break;

            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                items[prevIndex]?.focus();
                break;

            case 'Escape':
                this.closeAllDropdowns();
                dropdown.querySelector('.dropdown-toggle').focus();
                break;

            case 'Tab':
                if (!e.shiftKey && currentIndex === items.length - 1) {
                    e.preventDefault();
                    this.closeAllDropdowns();
                }
                break;
        }
    }

    // API pública
    toggleMobileMenu(show) {
        if (this.mobileMenu) {
            this.mobileMenu.toggle(show);
        }
    }

    closeAll() {
        this.closeAllDropdowns();
        if (this.mobileMenu && this.mobileMenu.isOpen()) {
            this.mobileMenu.toggle(false);
        }
    }
}