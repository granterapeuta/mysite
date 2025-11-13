/**
 * Contact Manager - Gestión segura de contactos
 * Protege datos sensibles y proporciona enlaces directos
 */

class ContactManager {
    constructor() {
        // Datos codificados para mayor seguridad
        this.contactData = {
            phone: this.decodeData('KzM0IDY4MCA3NjAgMDA3'), // Teléfono codificado
            whatsapp: this.decodeData('KzM0NjgwNzYwMDA3'), // WhatsApp codificado
            email: this.decodeData('Z3JhbnRlcmFwZXV0YUBnbWFpbC5jb20=') // email codificado
        };

        this.init();
    }
    
    /**
     * Decodifica datos en base64 (solo para ofuscar ligeramente)
     */
    decodeData(encodedData) {
        return atob(encodedData);
    }

    /**
     * Inicializa los event listeners
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupWhatsAppButton();
            this.setupPhoneButton();
            this.setupEmailButton();
        });
    }

    /**
     * Configura el botón de WhatsApp
     */
    setupWhatsAppButton() {
        const whatsappBtn = document.getElementById('whatsapp-btn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWhatsApp();
            });
        }
    }

    /**
     * Configura el botón de llamada
     */
    setupPhoneButton() {
        const phoneBtn = document.getElementById('phone-btn');
        if (phoneBtn) {
            phoneBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.makePhoneCall();
            });
        }
    }

    /**
     * Configura el botón de email
     */
    setupEmailButton() {
        const emailBtn = document.getElementById('email-btn');
        if (emailBtn) {
            emailBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendEmail();
            });
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
     * Función para trackeo de interacciones (opcional)
     */
    trackContact(method) {
        console.log(`Contacto realizado vía: ${method}`);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact', {
                'event_category': 'engagement',
                'event_label': method
            });
        }
    }

    /**
     * Método para obtener datos de contacto (si se necesitan en otros lugares)
     */
    getContactInfo(type) {
        switch(type) {
            case 'phone':
                return this.contactData.phone;
            case 'whatsapp':
                return this.contactData.whatsapp;
            case 'email':
                return this.contactData.email;
            default:
                return null;
        }
    }
}

// Inicialización automática cuando se carga el script
const contactManager = new ContactManager();