# Propuestas de mejora UX/UI: flujo de envío de remesas

## 1. Reducción de pantallas

Actualmente el flujo tiene 2 pantallas previas y 7 pasos.

- **Pantallas iniciales:** unificar la selección del tipo de transacción y la búsqueda del cliente en una sola pantalla, antes de continuar con el envío.
- **Método de pago y revisión de información:** fusionar ambos pasos en uno solo, "Revisar y cobrar", que muestre el resumen de la operación junto con el cobro.

## 2. Valores por defecto y autocompletado

| Elemento                            | Mejora propuesta                                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Tipo de transacción                 | Recordar y preseleccionar el último tipo utilizado.                                                                              |
| Tipo de identificación              | Preseleccionar Cédula según el país de la agencia y dejar el cursor listo para ingresar el número.                               |
| País y moneda de destino            | Recordar el último destino usado por el cliente o la agencia.                                                                    |
| Guardar en beneficiarios frecuentes | Dejar la opción marcada de inicio, permitiendo desmarcarla.                                                                      |
| Facturación                         | Que por defecto use los datos del remitente y se muestre de forma resumida, desplegándose solo si el cajero necesita cambiarlos. |
| PEP / allegado a PEP                | Mostrar el valor ya registrado en el perfil del cliente, en lugar de preguntarlo desde cero.                                     |

## 3. Mejoras por paso

### Beneficiario

- Es el paso con más datos por completar: 12 campos que hoy ocupan dos pantallas. Conviene reorganizar el formulario para que se vea completo en una sola pantalla.
- La lista de beneficiarios frecuentes solo muestra nombres, por lo que resulta difícil distinguirlos. Se deberían mostrar los 3 a 5 más recientes con datos que ayuden a identificarlos, como la ciudad y los últimos dígitos del teléfono.

### Método de pago

- El total (18,01) aparece repetido 6 veces en la misma pantalla.
- Falta lo que el cajero realmente necesita en este paso: registrar el monto recibido y calcular el vuelto.
- Hay términos que nombran lo mismo con palabras distintas ("Total a pagar" y "Total a cobrar"). "Agregar otra moneda" en realidad agrega otra forma de pago, y "Pago en efectivo / Cash" mezcla dos idiomas.
- El bloque inferior (total a cobrar, cobrado y saldo pendiente) repite información del panel de detalle. Conviene unificarlos.
- El "Saldo pendiente 0,00" se muestra en azul y parece un enlace. Debería usar un color que comunique su estado: verde cuando es cero, y ámbar o rojo cuando hay saldo.

### Revisión de información

- Hoy son tres pantallas con campos que parecen editables pero no lo son, con colores inconsistentes. Debe reemplazarse por un resumen de lectura, con la opción de editar cada sección y volver al paso correspondiente.
- Mostrar primero lo que el cajero confirma con el cliente: monto, cargo, total, beneficiario, país y lugar de pago. Estos datos deberían permanecer visibles mientras se revisa el resto. Los datos secundarios (documento, fecha de nacimiento, género) van después.
- Ocultar la información vacía o que no aporta: "Subtotal 0", "Servicio disponible: no hay opciones disponibles", "Monto envío" cuando es igual a "Monto a recibir", y "Tipo de cambio 1 USD".
- La acción que mueve el dinero se llama "Siguiente" y está al final de tres pantallas. Debe llamarse "Confirmar y enviar" y estar siempre visible junto al total.
- Mientras la operación se procesa, el botón "Volver" sigue habilitado y no debería estarlo.

### Confirmación

- El número de operación está bien destacado, pero falta poder copiarlo fácilmente y presentarlo en grupos de dígitos (por ejemplo, 1203 0070 733) para facilitar dictarlo.
- El mensaje es ambiguo y aparece antes del número. Se sugiere: "Entrega este número al cliente: el beneficiario lo necesita para cobrar". Además, faltan tildes en "Envío" y "necesitará".
- No hay un resumen de lo procesado ni acciones siguientes. Se sugiere agregar "Nuevo envío", "Repetir con el mismo cliente" y "Mismo beneficiario".
- El indicador de pasos, todo en verde, ocupa espacio sin aportar información.

## 4. Formato y legibilidad en todo el flujo

- **Títulos:** el prefijo "Envío de Remesa Sol & Luna - " se repite en cada sección y, en la revisión, genera títulos demasiado largos. Bastan nombres simples: "Remitente", "Beneficiario", etc.
- **Mayúsculas:** casi todo el texto está en mayúsculas (valores, textos de ayuda, pasos), lo que dificulta distinguir qué es importante. Si el proveedor exige nombres en mayúsculas, la conversión puede hacerse al momento del envío. Correos y textos de ayuda deben mostrarse en minúsculas.
- **Panel de detalle:** debe estar presente y visible en todos los pasos desde la cotización. Hoy falta en Remitente y en Revisión, y en Beneficiario desaparece al desplazarse hacia abajo.
- **Botones de navegación:** los botones Volver y Siguiente deben permanecer visibles en los pasos largos (Beneficiario y Revisión).
- **Estabilidad visual:** el contenido se corre levemente de posición según el paso, porque en algunos aparece la barra de desplazamiento y en otros no. Debe mantenerse estable.
- **Terminología:** definir un glosario único. Hoy conviven "Dirección e-mail" y "Dir. e-mail", "Nro.de Documento", "Dirección", "Dirección 1", "Dirección 2" y "Calle/Número", y "Total a pagar" y "Total a cobrar".

## 5. Inconsistencias de datos a verificar

1. **El total no coincide con la suma de sus partes:** 11,00 + 5,00 + 0,91 = 16,91, pero el total mostrado es 18,01. Hay que revisar si falta una línea de cargo por mostrar o si algún monto está desactualizado.