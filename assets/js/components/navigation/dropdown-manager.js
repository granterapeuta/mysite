// assets/js/components/navigation/dropdown-manager.js
// Gestión mejorada de dropdowns

import { Logger } from '../../core/logger.js';
import { eventBus } from '../../core/event-bus.js';

export class DropdownManager {
    constructor() {
        this.logger = new Logger('DropdownManager');
        this.dropdowns = new Map();
        this.init();
    }

    init() {
        this.setupDropdowns();
        this.setupEventListeners();
        this.logger.success('Inicializado');
    }

    setupDropdowns() {
        document.querySelectorAll('.dropdown').forEach((dropdown, index) => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (toggle && menu) {
                const dropdownId = `dropdown-${index}`;
                this.dropdowns.set(dropdownId, { dropdown, toggle, menu });
                this.setupDropdown(dropdown, toggle, menu);
            }
        });

        this.logger.info(`${this.dropdowns.size} dropdowns configurados`);
    }

    setupDropdown(dropdown, toggle, menu) {
        // Click en el toggle
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown(dropdown);
        });

        // Prevenir cierre al hacer clic dentro del menú
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Manejar items del menú
        menu.querySelectorAll('.dropdown-item, .theme-option, .accessibility-option input, .accessibility-option .intensity-slider').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                if (item.type === 'checkbox' || item.type === 'range') {
                    return;
                }

                setTimeout(() => {
                    this.closeDropdown(dropdown);
                }, 100);
            });
        });
    }

    toggleDropdown(targetDropdown) {
        const isOpen = targetDropdown.classList.contains('open');
        this.closeAllDropdowns();

        if (!isOpen) {
            this.openDropdown(targetDropdown);
        }
    }

    openDropdown(dropdown) {
        dropdown.classList.add('open');
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');

        if (menu) menu.classList.add('show');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');

        // Enfocar el primer elemento del menú
        setTimeout(() => {
            const firstItem = menu.querySelector('a, button, input');
            if (firstItem) firstItem.focus();
        }, 100);

        eventBus.emit('dropdown:opened', { dropdown });
        this.logger.debug('Dropdown abierto', { id: dropdown.id });
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('open');
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');

        if (menu) menu.classList.remove('show');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');

        eventBus.emit('dropdown:closed', { dropdown });
        this.logger.debug('Dropdown cerrado', { id: dropdown.id });
    }

    closeAllDropdowns() {
        this.dropdowns.forEach(({ dropdown }) => {
            this.closeDropdown(dropdown);
        });
        this.logger.debug('Todos los dropdowns cerrados');
    }

    setupEventListeners() {
        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            const openDropdown = document.querySelector('.dropdown.open');
            if (!openDropdown) return;

            const menu = openDropdown.querySelector('.dropdown-menu');
            if (!menu) return;

            const items = Array.from(menu.querySelectorAll('a, button, [tabindex="0"]'));
            const currentIndex = items.indexOf(document.activeElement);

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

                case 'Home':
                    e.preventDefault();
                    items[0]?.focus();
                    break;

                case 'End':
                    e.preventDefault();
                    items[items.length - 1]?.focus();
                    break;
            }
        });
    }
}