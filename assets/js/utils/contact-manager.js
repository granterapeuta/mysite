/**
 * Contact Manager - Gestión segura de contactos
 * Protege datos sensibles y proporciona enlaces directos
 */

class ContactManager {
    constructor() {
        this.logger = new Logger('ContactManager');
        this.isInitialized = false;

        // Datos codificados para mayor seguridad
        this.contactData = {
            phone: this.decodeData('KzM0IDY4MCA3NjAgMDA3'), // Teléfono codificado
            whatsapp: this.decodeData('KzM0NjgwNzYwMDA3'), // WhatsApp codificado
            email: this.decodeData('Z3JhbnRlcmFwZXV0YUBnbWFpbC5jb20=') // email codificado
            facebook: this.decodeData('aHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NhbHVkaW50ZWdyYWw=') // https://www.facebook.com/saludintegral
        };
    }

    /**
     * Inicializa el Contact Manager
     */
    async init() {
        try {
            this.logger.info('Inicializando Contact Manager...');

            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupContactElements());
            } else {
                this.setupContactElements();
            }

            this.isInitialized = true;
            this.logger.success('Contact Manager inicializado correctamente');

        } catch (error) {
            this.logger.error('Error inicializando Contact Manager', error);
        }
    }

    /**
     * Configura todos los elementos de contacto
     */
    setupContactElements() {
        this.setupWhatsAppButtons();
        this.setupPhoneButtons();
        this.setupEmailButtons();
        this.setupFooterLinks();
        this.setupSocialLinks();
    }

    /**
     * Configura botones de WhatsApp
     */
    setupWhatsAppButtons() {
        const whatsappButtons = document.querySelectorAll('#whatsapp-btn, .whatsapp-link, [data-contact="whatsapp"]');

        whatsappButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWhatsApp();
            });

            // Actualizar href si es un enlace
            if (button.tagName === 'A') {
                button.href = '#';
            }
        });
    }

    /**
     * Configura botones de teléfono
     */
    setupPhoneButtons() {
        const phoneButtons = document.querySelectorAll('#phone-btn, .phone-link, [data-contact="phone"]');

        phoneButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.makePhoneCall();
            });

            if (button.tagName === 'A') {
                button.href = '#';
            }
        });
    }

    /**
     * Configura botones de email
     */
    setupEmailButtons() {
        const emailButtons = document.querySelectorAll('#email-btn, .email-link, [data-contact="email"]');

        emailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendEmail();
            });

            if (button.tagName === 'A') {
                button.href = '#';
            }
        });
    }

    /**
     * Configura enlaces del footer
     */
    setupFooterLinks() {
        const footerEmail = document.getElementById('footer-email');
        const footerWhatsapp = document.getElementById('footer-whatsapp');
        const footerFacebook = document.getElementById('footer-facebook');

        if (footerEmail) {
            footerEmail.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendEmail();
            });
            footerEmail.href = '#';
        }

        if (footerWhatsapp) {
            footerWhatsapp.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWhatsApp();
            });
            footerWhatsapp.href = '#';
        }

        if (footerFacebook) {
            footerFacebook.addEventListener('click', (e) => {
                e.preventDefault();
                this.openFacebook();
            });
            footerFacebook.href = '#';
        }
    }

    /**
     * Configura enlaces sociales adicionales
     */
    setupSocialLinks() {
        // Buscar enlaces sociales existentes y actualizarlos
        const socialLinks = document.querySelectorAll('a[href*="facebook"], a[href*="wa.me"], a[href^="mailto:"]');

        socialLinks.forEach(link => {
            if (link.href.includes('facebook')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openFacebook();
                });
                link.href = '#';
            } else if (link.href.includes('wa.me')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openWhatsApp();
                });
                link.href = '#';
            } else if (link.href.startsWith('mailto:')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.sendEmail();
                });
                link.href = '#';
            }
        });
    }

    /**
     * Decodifica datos en base64
     */
    decodeData(encodedData) {
        try {
            return atob(encodedData);
        } catch (error) {
            this.logger.error('Error decodificando datos', error);
            return '';
        }
    }

    /**
     * Abre WhatsApp con el número preconfigurado
     */
    openWhatsApp() {
        const phoneNumber = this.contactData.whatsapp;
        const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios de salud integral.');
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        this.trackContact('whatsapp');
    }

    /**
     * Inicia una llamada telefónica
     */
    makePhoneCall() {
        const phoneNumber = this.contactData.phone.replace(/\s/g, '');

        if (confirm('¿Deseas llamar ahora a Germán Rojas Varela?')) {
            window.location.href = `tel:${phoneNumber}`;
            this.trackContact('phone');
        }
    }

    /**
     * Abre el cliente de email
     */
    sendEmail() {
        const email = this.contactData.email;
        const subject = encodeURIComponent('Consulta - Salud Integral con Germán Rojas Varela');
        const body = encodeURIComponent(`Hola Germán,\n\nMe gustaría obtener más información sobre sus servicios de salud integral.\n\nMi consulta es:\n\nSaludos cordiales.`);

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        this.trackContact('email');
    }

    /**
     * Abre Facebook
     */
    openFacebook() {
        const facebookUrl = this.contactData.facebook;
        window.open(facebookUrl, '_blank', 'noopener,noreferrer');
        this.trackContact('facebook');
    }

    /**
     * Función para trackeo de interacciones
     */
    trackContact(method) {
        this.logger.info(`Contacto realizado vía: ${method}`);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact', {
                'event_category': 'engagement',
                'event_label': method
            });
        }
    }

    /**
     * Método para obtener datos de contacto
     */
    getContactInfo(type) {
        return this.contactData[type] || null;
    }

    /**
     * Reinicia el módulo
     */
    restart() {
        this.logger.info('Reiniciando Contact Manager...');
        this.setupContactElements();
        this.logger.success('Contact Manager reiniciado');
    }

    /**
     * Obtiene el estado del módulo
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            contactMethods: Object.keys(this.contactData),
            version: '1.0.0'
        };
    }
}

// Exportar para uso modular
export { ContactManager };