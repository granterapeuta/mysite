// assets/js/core/event-bus.js
import { Logger } from './logger.js';

export class EventBus {
    constructor() {
        this.events = new Map();
        this.logger = new Logger('EventBus');
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
        this.logger.debug(`Listener añadido para: ${event}`);
    }

    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                this.logger.debug(`Listener removido para: ${event}`);
            }
        }
    }

    emit(event, data = null) {
        this.logger.debug(`Evento emitido: ${event}`, data);

        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.logger.error(`Error en listener de ${event}:`, error);
                }
            });
        }
    }

    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// Singleton global
export const eventBus = new EventBus();