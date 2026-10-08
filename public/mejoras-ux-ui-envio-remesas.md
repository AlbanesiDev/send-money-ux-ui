# Mejoras UX/UI: Envío de remesas (vista del cajero)

**Objetivo:** que el cajero haga más transacciones por turno, se equivoque menos al cobrar y cumpla con las validaciones sin esfuerzo extra.

## 1. Velocidad de atención

| Mejora | Actual | Propuesta | Por qué importa |
|---|---|---|---|
| **Inicio unificado** | Hay dos pantallas, "Búsqueda de transacción" y "Datos búsqueda", con mucho espacio vacío. | Un solo paso con tipo de transacción, tipo y número de documento, y buscar. | Menos clics y menos cambios de pantalla en cada cliente. |
| **Selects con buscador** | Hay que bajar por listas largas de países, estados, ciudades y locaciones. | Se escribe para filtrar, con banderas en los países. | Encontrar "La Paz" o "Bolivia" pasa de varios scrolls a 2 o 3 teclas. |
| **Navegación con teclado** | Casi todo se hace con mouse. | Enter avanza, el foco pasa solo al siguiente campo y hay atajos para moverse. | Los cajeros con experiencia trabajan con teclado; se carga mucho más rápido. |
| **Facturación por defecto** | Los datos de factura se cargan a mano. | Se usan los datos del remitente y solo se editan si cambian. | Se evita volver a escribir información que ya existe. |
| **Cierre con "Nueva transacción"** | Al terminar no hay una acción clara para seguir. | Botón principal "Nueva transacción", además de imprimir y descargar. | Se atiende al siguiente cliente de la fila sin navegar por el menú. |

## 2. Menos errores al cobrar

| Mejora | Actual | Propuesta | Por qué importa |
|---|---|---|---|
| **Resumen fijo y claro** | El panel "Detalle" muestra 0 USD mientras calcula, y en la revisión aparece "Subtotal 0" junto a "Total 18,01". | Resumen fijo al costado con monto, cargo, IVA, total y lo que recibe el beneficiario. Solo se muestra cuando hay datos. | Los ceros y los valores que se contradicen generan dudas y errores de cobro. |
| **Validación del monto** | Se aceptan formatos ambiguos y "Procesando..." no da más información. | El monto se limpia y normaliza (decimales, separadores) y se ve claramente cuándo está cotizando. | Se evitan cotizaciones mal hechas y cobros incorrectos. |
| **Pago y saldo pendiente** | Los totales cobrado y pendiente quedan abajo y no se destacan. | Total a cobrar, cobrado y pendiente se ven en primer plano y no se puede avanzar con saldo pendiente. | Es el momento de mayor riesgo de descuadre de caja. |
| **Errores accionables** | No hay un estado de error claro, por ejemplo si falla la cotización o no se encuentra el cliente. | Mensajes concretos con opción de reintentar, sin perder lo que ya se cargó. | El cajero no tiene que empezar de nuevo ni llamar a soporte por un error temporal. |

## 3. Revisión antes de confirmar

| Mejora | Actual | Propuesta | Por qué importa |
|---|---|---|---|
| **Revisión legible** | El paso "Visualizar información" es una pantalla larga de campos deshabilitados que parecen inputs y que hay que recorrer con scroll. | Resumen agrupado (transacción, remitente, beneficiario, pago) con un botón "Editar" en cada sección. | Se revisa de un vistazo con el cliente y se corrige solo lo necesario, sin rehacer pasos. |
| **Stepper navegable** | Hay 7 pestañas en mayúsculas con nombres largos y no queda claro si se puede volver. | Nombres cortos y se puede hacer clic en los pasos ya completados para volver. | Corregir algo es más rápido y el cajero sabe en qué paso está. |
| **Encabezado del cliente** | La franja violeta tiene íconos de lápiz y ojo sin etiqueta. | El contexto del cliente queda visible y las acciones tienen texto o tooltip. | Se evitan clics a ciegas y queda claro con quién se está operando. |

## 4. Cumplimiento (PEP / operación sospechosa)

| Mejora | Actual | Propuesta | Por qué importa |
|---|---|---|---|
| **Declaraciones visibles** | Son 4 checkboxes chicos y sueltos en una pantalla casi vacía. | Tarjetas grandes y legibles que, al marcarse, muestran los campos extra que hacen falta. | Baja el riesgo de que se omitan por apuro. Es un punto de auditoría y regulatorio. |
| **Alertas del cliente** | "Teléfono sin validar" aparece en rojo chico, fácil de pasar por alto. | La alerta se destaca y se puede resolver dentro del mismo flujo. | Si falta un dato, se resuelve antes del cobro y no después. |

## 5. Consistencia visual y accesibilidad

- **Jerarquía clara:** se sacan los títulos repetidos ("Envío de Remesa Sol & Luna – …" en cada bloque) y se usa un solo botón principal por pantalla. Así el cajero ve enseguida qué hacer.
- **Mejor lectura:** el texto en mayúsculas en campos y pestañas se reemplaza por una tipografía más legible, con mejor contraste. Esto cansa menos la vista en turnos largos.
- **Estados de carga accesibles:** las cargas se anuncian a lectores de pantalla y los botones quedan bloqueados mientras se procesa. Así se evitan envíos duplicados por doble clic.

## Impacto esperado (para medir)

- **Tiempo por transacción:** debería bajar por menos pantallas, más teclado y selects con buscador.
- **Errores de cobro y cuadre de caja:** deberían bajar gracias al resumen fijo, el monto validado y el saldo pendiente bloqueante.
- **Correcciones posteriores y anulaciones:** deberían bajar por la revisión con edición por sección.
- **Omisiones en PEP/sospechosa:** deberían bajar con declaraciones visibles y obligatorias.

**Para validar con el negocio:** medir tiempo promedio por transacción y tasa de anulaciones antes y después del cambio, en una o dos agencias piloto.
