console.log("rateLimiter.js v1.0")

/**
 * Permite ejecutar acciones limitando las ejecuciones consecutivas que pueden
 * llevarse a cabo en un intervalo de tiempo determinado.
 */
export class RateLimiter {

    /**
     * Inicializa una nueva instancia de `RateLimiter`.
     *
     * @param {number} intervalo - Intervalo de tiempo en milisegundos entre ejecuciones consecutivas.
     */
    constructor(intervalo) {

        this.intervalo = intervalo

        this.accionEnCola = null      // Acción en cola pendiente de ejecutar
        this.ejecutando = false       // Indica si hay una ejecución en curso
        this.tiempoUltEjecucion = 0   // Tiempo de la última ejecución

        // Enlaza el método `_ejecutarAcciones` para que mantenga el contexto actual
        this._ejecutarAcciones = this._ejecutarAcciones.bind(this)
    }

    /**
     * Ejecuta una acción respetando el límite de ejecuciones consecutivas en
     * el intervalo configurado.
     *
     * @param {function} accion - Acción a ejecutar.
     */
    ejecutar(accion) {

        // Pone la acción en cola
        this.accionEnCola = accion

        // Verifica si se puede ejecutar la acción inmediatamente
        if (!this.ejecutando)
            this._ejecutarAcciones()
    }

    /**
     * Función interna del `RateLimiter` que se asegura de respetar el límite
     * de tiempo entre ejecuciones consecutivas.
     * Para ejecutar acciones, usa `ejecutar(accion)` en su lugar.
     */
    _ejecutarAcciones() {

        // Si no hay acción en cola o ya se está ejecutando una, ignoramos la ejecución
        if (this.accionEnCola == null || this.ejecutando)
            return;

        const tiempoActual = new Date().getTime()
        const tiempoTranscurrido = tiempoActual - this.tiempoUltEjecucion

        // Verifica si ha pasado el tiempo suficiente desde la última ejecución
        if (tiempoTranscurrido >= this.intervalo) {

            const accion = this.accionEnCola
            this.accionEnCola = null

            this.ejecutando = true
            this.tiempoUltEjecucion = tiempoActual

            // Ejecuta la acción y luego permitir la ejecución de más acciones
            accion()
            this.ejecutando = false
            this._ejecutarAcciones()

        } else {
            // Espera antes de intentar ejecutar la próxima acción
            setTimeout(this._ejecutarAcciones, this.intervalo - tiempoTranscurrido)
        }
    }
}
