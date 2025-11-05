// assets/js/main.js

// Punto de entrada principal - carga todos los módulos
import './core/app.js';

// Inicializar accesibilidad si existe
import './accessibility/accessibility-main.js';

console.log('🎯 Aplicación cargada correctamente');

// Comandos globales para desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG = {
        // Acceso rápido a módulos
        app: window.app,
        accessibility: window.accessibilitySystem,

        // Utilidades
        logs: () => JSON.parse(localStorage.getItem('app_logs') || '[]'),
        clearLogs: () => localStorage.removeItem('app_logs'),

        // Partículas
        particles: window.particleSystem,
        brighter: () => window.particleSystem?.makeBrighter(),
        larger: () => window.particleSystem?.makeLarger(),
        restartParticles: () => window.particleSystem?.restart()
    };

    console.log('🔧 Comandos de debug disponibles en window.DEBUG');
}