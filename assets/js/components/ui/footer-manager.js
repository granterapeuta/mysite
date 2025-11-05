// assets/js/components/ui/footer-manager.js

import { Logger } from '../../core/logger.js';

export class FooterManager {
    constructor() {
        this.logger = new Logger('FooterManager');
        this.init();
    }

    init() {
        this.updateYear();
        this.logger.success('Inicializado');
    }

    updateYear() {
        const yearElement = document.querySelector('footer .container p');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.innerHTML = yearElement.innerHTML.replace(/2025/, currentYear);
            this.logger.debug('Año actualizado', { year: currentYear });
        }
    }
}