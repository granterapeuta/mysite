// assets/js/main.js

// Punto de entrada principal - carga todos los módulos
import { app } from './core/app.js';

// Inicializar accesibilidad si existe
let accessibilitySystem = null;
try {
    const { accessibilitySystem: accSystem } = await import('./accessibility/accessibility-main.js');
    accessibilitySystem = accSystem;
} catch (error) {
    console.log('ℹ️ Módulo de accesibilidad no encontrado o no necesario');
}

/**
 * Inicializa la aplicación cuando el DOM esté listo
 */
async function initializeApplication() {
    try {
        console.log('🎯 Inicializando aplicación...');

        // Esperar a que la app esté inicializada
        await waitForAppInitialization();

        // Actualizar año actual
        updateCurrentYear();

        // Configurar comandos de desarrollo
        setupDevelopmentTools();

        console.log('🎯 Aplicación cargada correctamente');

    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
    }
}

/**
 * Espera a que la aplicación esté completamente inicializada
 */
function waitForAppInitialization() {
    return new Promise((resolve) => {
        const checkInitialization = () => {
            if (window.app && window.app.isInitialized) {
                resolve();
            } else {
                setTimeout(checkInitialization, 100);
            }
        };
        checkInitialization();
    });
}

/**
 * Actualiza el año actual en el footer
 */
function updateCurrentYear() {
    const currentYearElements = document.querySelectorAll('#current-year, .current-year');
    const currentYear = new Date().getFullYear();

    currentYearElements.forEach(element => {
        element.textContent = currentYear;
    });

    if (currentYearElements.length > 0) {
        console.log('📅 Año actual actualizado:', currentYear);
    }
}

/**
 * Configura herramientas de desarrollo
 */
function setupDevelopmentTools() {
    // Solo en entorno de desarrollo
    if (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local')) {

        window.DEBUG = {
            // Acceso rápido a módulos
            app: window.app,
            accessibility: accessibilitySystem,

            // Estado de la aplicación
            status: () => window.app?.getStatus?.() || 'App no disponible',

            // Módulos específicos
            getModule: (name) => window.app?.getModule?.(name),
            modules: () => window.app?.getModules?.() || [],

            // Utilidades de debug
            logs: () => {
                try {
                    return JSON.parse(localStorage.getItem('app_logs') || '[]');
                } catch {
                    return [];
                }
            },
            clearLogs: () => {
                localStorage.removeItem('app_logs');
                console.log('📋 Logs limpiados');
            },

            // Partículas (si están disponibles)
            particles: window.particleSystem,
            brighter: () => {
                if (window.particleSystem?.makeBrighter) {
                    window.particleSystem.makeBrighter();
                    console.log('✨ Partículas más brillantes');
                } else {
                    console.log('❌ Sistema de partículas no disponible');
                }
            },
            larger: () => {
                if (window.particleSystem?.makeLarger) {
                    window.particleSystem.makeLarger();
                    console.log('🔍 Partículas más grandes');
                } else {
                    console.log('❌ Sistema de partículas no disponible');
                }
            },
            restartParticles: () => {
                if (window.particleSystem?.restart) {
                    window.particleSystem.restart();
                    console.log('🔄 Partículas reiniciadas');
                } else {
                    console.log('❌ Sistema de partículas no disponible');
                }
            },

            // Contact Manager (si está disponible)
            contact: () => window.app?.getModule?.('contact'),
            testContact: () => {
                const contactManager = window.app?.getModule?.('contact');
                if (contactManager) {
                    console.log('📞 Contact Manager:', contactManager.getStatus?.());
                } else {
                    console.log('❌ Contact Manager no disponible');
                }
            },

            // Theme Manager
            theme: () => window.app?.getModule?.('theme'),
            changeTheme: (themeName) => {
                if (window.app?.eventBus) {
                    window.app.eventBus.emit('theme:change', { theme: themeName });
                    console.log('🎨 Tema cambiado a:', themeName);
                }
            }
        };

        console.log('🔧 Comandos de debug disponibles en window.DEBUG');
        console.log('📋 Try: DEBUG.status(), DEBUG.theme(), DEBUG.contact()');
    }
}

/**
 * Maneja errores no capturados
 */
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('🚨 Error no capturado:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('🚨 Promise rechazada no manejada:', event.reason);
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// Configurar manejo de errores
setupErrorHandling();

// Exportar para uso modular si es necesario
export { initializeApplication };