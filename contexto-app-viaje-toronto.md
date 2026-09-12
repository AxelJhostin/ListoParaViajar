# Listo Para Viajar — especificación del proyecto

Actualizado: 11 de septiembre de 2026. Este documento consolida el contexto original, las decisiones posteriores de Axel y la implementación actual. Reemplaza las referencias antiguas a presupuestos, datos de demostración y una supuesta segunda fase.

## 1. Propósito y contexto

Bitácora familiar para organizar el primer viaje internacional de Axel y Sebastián, acompañados por su abuela. Debe servir durante el viaje y al regresar para revisar y explicar los gastos.

- Viajeros: Axel Hernández Menéndez, Sebastián Hernández Menéndez y Sumba Abuelita. No se inventa un nombre completo para la abuela.
- Salida: lunes 14 de septiembre de 2026, desde Manta.
- Ruta de ida confirmada para el boleto de Axel: Manta → Quito → Bogotá → Toronto. Regreso por la ruta inversa.
- Llegada a Toronto: martes 15 de septiembre, 07:20 hora local, al aeropuerto Toronto Pearson (YYZ), Terminal 1.
- Último día completo en Canadá: 24 de septiembre.
- Regreso a Manta: 25 de septiembre, 20:10 hora local. Seis vuelos Avianca están registrados en la aplicación; se debe confirmar que Sebastián y Sumba tengan el mismo itinerario.
- Toronto es el destino confirmado. Montreal es una posible visita familiar, no una reserva ni excursión confirmada.
- No hay itinerario turístico fijo; los familiares proponen actividades y habrá días libres.
- Todos son mayores de edad. Todos pueden editar todos los registros; principalmente uno anotará y el resto consultará. Mamá y papá también pueden seguir las cuentas.

Bogotá es la conexión confirmada. Los aeropuertos, vuelos, terminales conocidas y horarios del boleto de Axel están registrados; el hospedaje sigue pendiente. Todos los datos de ruta permanecen editables.

## 2. Decisiones de alcance

1. Una versión completa para este viaje, sin MVP recortado ni segunda fase comprometida.
2. PWA pensada primero para celulares, también usable en escritorio.
3. Frontend y API de Next.js preparados para Vercel; Neon es la base de datos externa.
4. **Axel realiza el despliegue. No desplegar automáticamente en Vercel.**
5. Texto, números y estados compartidos; imágenes y PDF exclusivamente locales.
6. Escritura local durable antes del envío, cola de sincronización y recuperación al volver la conexión.
7. Acceso compartido sin cuentas ni roles. Quien conoce la URL puede leer y editar.
8. **Sin monto inicial, presupuesto máximo, saldo disponible ni porcentaje de presupuesto.** Se registran desembolsos y se consulta su total acumulado/final.
9. CAD y USD como monedas; las conversiones son referenciales.
10. Modo claro, oscuro y automático, estadísticas, exportación y respaldos incluidos.

No forman parte del alcance: OCR, pagos, reparto de deudas, chat, mapas descargables, clima, transporte en vivo, asesoría migratoria, calculadora tributaria, autenticación compleja ni múltiples viajes. Los elementos decorativos de Stitch no agregan funcionalidades por sí solos.

## 3. Experiencia y diseño aprobado

Fuente: exportación local de Google Stitch, carpeta `stitch_listo_para_viajar_pwa/`, sistema `Canada Explorer Heritage`.

Referencias conservadas: resumen, control de gastos, nuevo gasto, conversor y logo. Los HTML/capturas sirven de referencia visual, no se usan como aplicación final ni como fuente de datos del viaje.

Identidad: rojo arce, verde bosque, fondo crema, títulos oscuros, ámbar para pendientes, Plus Jakarta Sans local, tarjetas redondeadas y navegación inferior. El modo oscuro conserva la identidad con colores de contraste comprobado.

La navegación principal tiene Resumen, Gastos, Compras, Equipaje y Más. El conversor es accesible desde cualquier pantalla. Más contiene documentos, ruta, información, días libres, estadísticas, reportes y ajustes.

Controles con labels y foco visible; formularios de dinero con teclado decimal; diálogos que conservan el formulario ante errores; confirmación antes de eliminar o cerrar formularios modificados; soporte de safe areas. Los gráficos se acompañan de números y etiquetas.

Ninguna cifra de las capturas —“192 días”, totales, porcentajes o registros— es un valor inicial real. No se cargan CDN de Tailwind, fuentes de iconos externas ni URLs temporales de Stitch.

## 4. Requisitos por módulo

### Resumen

Cuenta regresiva calculada con la fecha actual, periodo del viaje, llegada aproximada, ruta de conexiones, nombres, estado de sincronización y última sincronización. Total registrado y progreso real de equipaje, compras y documentos. Accesos rápidos a registrar gastos y a revisar lo esencial. Montreal aparece como tentativo.

### Gastos

Campos: concepto/lugar, monto original, moneda CAD o USD, categoría, persona que pagó, método de pago, fecha, hora, notas y tasa histórica opcional. Las fechas iniciales del formulario usan Toronto y son editables.

Categorías: comida, transporte, compras, regalos, actividades, hospedaje, salud y otros. Personas sugeridas: Axel, Sebastián, Abuelita, Mamá y Papá, con nombre libre. Métodos: efectivo, crédito, débito, transferencia, Apple/Google Pay y otro.

Crear, editar y eliminar con confirmación; búsqueda; filtros de fecha, categoría, persona, método, moneda original y presencia de adjuntos locales; limpiar filtros; totales CAD/USD y CSV de la selección. Los borrados se sincronizan como eliminaciones lógicas.

Un gasto se guarda antes de adjuntar archivos. Si falla la cámara o no queda espacio, el dinero ya registrado se conserva. Cada tarjeta distingue cambios pendientes.

### Conversor CAD ⇄ USD

Monto editable, inversión de monedas, cantidades rápidas y resultado a dos decimales. Usa una sola relación USD por CAD para que ambas direcciones sean coherentes.

Tasa automática desde Frankfurter a través de la API del servidor, fuente/fecha/hora visibles, última tasa guardada disponible sin internet, actualización explícita y tasa manual. Una tasa manual se conserva hasta que se solicita otra actualización. Una respuesta fallida no borra la última tasa.

Cada gasto conserva su tasa original. Actualizar el conversor no recalcula silenciosamente gastos anteriores. Sin tasa se admite el gasto en su moneda original y se indica qué montos no pudieron convertirse.

### Equipaje

Elemento, persona responsable, categoría, cantidad, ida/regreso, pendiente/empacado y notas. Se pueden agregar categorías y nombres personalizados. Búsqueda y filtros por persona, categoría, estado y trayecto. Progreso general y por persona. CRUD, cambio rápido de estado y adjuntos locales.

### Compras y regalos

Producto, destinatario libre, precio estimado y final en CAD, prioridad normal/importante, notas y estados pendiente/comprado/empacado. Búsqueda, filtros por destinatario/estado, fotos locales y vínculo opcional con un gasto ya registrado.

Los totales estimado y final reflejan la selección. Los precios ausentes se identifican. Estos totales son informativos: **solo los registros de Gastos forman las cuentas**. Una compra no crea otro desembolso al cambiar de estado. Varios productos pueden enlazarse al mismo recibo sin sumar ese gasto más de una vez.

### Documentos esenciales

Documento, viajero, etapa o trayecto, pendiente/revisado/listo, vencimiento opcional, notas y adjuntos locales. Búsqueda, filtros y progreso.

Seed de cuatro entradas por viajero: cédula de identidad, pasaporte, documentos de ida y documentos de regreso. Todo comienza pendiente. Cédula y pasaporte corresponden a todo el viaje; ida/regreso se separan. Se permite agregar otros requisitos después.

Se muestra una advertencia si un vencimiento ingresado es anterior o igual al final del viaje. Esto **no valida requisitos de entrada, tránsito ni validez legal**: la familia debe comprobar sus boletos y documentación oficial.

### Ruta y vuelos

Seis trayectos iniciales editables, según el boleto de Axel: AV1695, AV8376, AV254, AV255, AV8373 y AV1696. Cada uno tiene descripción, dirección ida/regreso, orden, fecha, hora, aeropuerto, aerolínea, vuelo, terminal, zona horaria IANA y notas. Se permiten nuevas conexiones. Los registros advierten confirmar que los demás pasajeros compartan este itinerario.

Cada vuelo tiene cuenta regresiva en vivo. Los inicios de trayecto calculan la hora recomendada de llegada al aeropuerto y, cuando se completa la duración del traslado, la hora para salir del alojamiento. Las conexiones calculan cuándo estar en la puerta. Los márgenes iniciales son 120 minutos en Manta, 180 en Toronto y 45 para conexiones, todos editables.

La app recuerda 24 horas, 6 horas, 1 hora y 15 minutos antes. Los avisos internos y las notificaciones concedidas por el navegador se ejecutan localmente, sin proveedor externo. No se promete un aviso con la app completamente cerrada porque el sistema puede suspenderla.

### Información importante

Entradas editables para hospedaje en Toronto, contacto local, seguro y notas. Agregar campos propios con título, contenido, notas y archivos locales. Los valores desconocidos permanecen vacíos, no se muestran ejemplos como reservas reales.

### Días libres

Lugar/actividad, ciudad libre, prioridad, estado pendiente/considerada/realizada/descartada, dirección, enlace HTTP(S), notas y fotos. Búsqueda/filtros por ciudad y estado. Las ideas en Montreal recuerdan que la visita no está confirmada.

### Estadísticas y reportes

Totales y distribución por categoría, día, persona y método; progreso de preparación. Ningún gráfico utiliza presupuesto inicial.

CSV de todos los gastos o selección. Reporte imprimible y PDF mediante el diálogo del sistema; filtros por fecha, categoría y persona, agrupaciones y tabla detallada. Incluye fecha de generación, última sincronización, pendientes y advertencia sobre conversiones referenciales.

Las imágenes locales de recibos se incluyen solo al activar la opción. Los PDF adjuntos se descargan aparte. El CSV no es un respaldo recuperable.

### Ajustes

Tema claro/oscuro/automático; cantidad de cambios pendientes, error y última sincronización; reintento manual; comparación/resolución de conflictos; exportación e importación ZIP; solicitud de persistencia de almacenamiento e instrucciones de instalación.

## 5. Fotos, PDF y respaldos

- Cámara, galería y selector de PDF; usos: recibos, comprobantes, productos, compras, lugares y documentos.
- Máximo 15 MB por archivo de entrada. Las imágenes decodificables se comprimen a JPEG de hasta 1800 px; los PDF mantienen el original.
- IndexedDB conserva metadatos y bytes binarios; en la UI se reconstruyen Blob/Object URLs. Esta representación evita problemas de almacenamiento Blob observados en WebKit.
- Los archivos, nombres e identificadores locales no se envían a Neon.
- Ver, descargar o eliminar con confirmación. Eliminar el registro no destruye automáticamente sus archivos: quedan en el respaldo local.
- Otro dispositivo indica que no tiene adjuntos locales, sin afirmar que puede localizar fotos de otro teléfono.
- ZIP con registros, tasa y archivos. Importación transaccional validada; agrega ausentes y no pisa existentes. Máximo 200 MB comprimido y 250 MB descomprimido.
- Los cambios recuperados se encolan. Una diferencia con la nube se resuelve explícitamente.
- Borrar datos del sitio, cambiar de navegador/dominio o pérdida del teléfono puede eliminar los adjuntos. Descargar respaldos periódicos.

## 6. Modelo de datos y modularidad

Next.js App Router, React, TypeScript estricto, Drizzle y PostgreSQL mediante `pg`. Validación compartida Zod. CSS semántico propio, iconos Lucide, IndexedDB con `idb`, ZIP con `fflate`.

Capas separadas: `domain` para tipos/reglas/dinero, `local` para persistencia y sincronización, `server` para base/servicios, `features` para módulos y `components` para controles compartidos. Las páginas componen módulos; no ejecutan SQL desde el navegador.

PostgreSQL:

| Tabla             | Responsabilidad                                                                   |
| ----------------- | --------------------------------------------------------------------------------- |
| `trip_records`    | UUID, tipo de módulo, JSONB validado, versión, hora del servidor y borrado lógico |
| `sync_operations` | UUID de operación, registro afectado y respuesta para reintentos idempotentes     |

Tipos de registro: expense, packing, purchase, document, idea, leg, info. No hay tablas de presupuestos ni almacenamiento remoto de archivos. Los importes originales son centavos enteros, no flotantes.

El SQL preliminar multitabla del documento anterior fue reemplazado por este esquema, adecuado al viaje y con validación por módulo. La explicación y límites de escalabilidad están en [arquitectura](docs/ARQUITECTURA.md).

## 7. Sincronización y offline

1. Validar entrada.
2. Guardar registro y operación juntos en una transacción IndexedDB.
3. Confirmar guardado local.
4. Enviar operación con UUID y versión base.
5. El servidor serializa escrituras del mismo registro, valida versión y guarda registro/confirmación en una transacción.
6. Retirar únicamente la operación confirmada. Conservar una edición posterior mientras estaba en vuelo el envío.
7. Descargar la copia compartida sin sobrescribir pendientes locales.

Reintentos al abrir, guardar, reconectar, volver a la pestaña y cada 15 segundos mientras está visible. Web Locks y BroadcastChannel coordinan pestañas.

Los conflictos conservan ambas versiones para elegir en Ajustes. No gana el reloj del teléfono ni se descarta un cambio silenciosamente. Los borrados lógicos evitan resurrecciones automáticas.

El service worker de producción precarga las doce rutas y los recursos necesarios, incluidas fuentes. Las páginas usan la caché de su compilación; los datos se rehidratan desde IndexedDB y se sincronizan por API, fuera de esa caché. Una nueva versión avisa antes de activarse.

Limitaciones explícitas: primera apertura con internet; primera copia del viaje con servidor disponible; no hay sincronización garantizada con la app cerrada; enlaces externos requieren su propia conexión; caché del sistema y almacenamiento no son una garantía contra borrado del dispositivo.

## 8. Entornos, privacidad y publicación

Repositorio: [AxelJhostin/ListoParaViajar](https://github.com/AxelJhostin/ListoParaViajar).

Neon: proyecto `viaje`, rama de desarrollo y rama de QA separadas de producción. Secretos en archivos de entorno ignorados, nunca en documentación, capturas, bundle cliente ni variables `NEXT_PUBLIC_`.

Señales noindex, validación de entradas y control de origen en escrituras del navegador. Esto no convierte la URL en privada: no hay autenticación. Es una decisión aceptada del uso familiar.

Aplicación y API pueden ejecutarse en Vercel con runtime Node y conexión pooled; migraciones se realizan antes por conexión directa. El build no modifica la base. **No se ha desplegado en Vercel ni se autoriza hacerlo en esta tarea.**

## 9. Calidad y aceptación

La versión debe entregar código modular, dependencias fijadas, migraciones repetibles, README operativo y pruebas que cubran dinero, persistencia, reintentos, conflictos, archivos, pantallas y accesibilidad.

Antes de usarla en el viaje:

- Lint, TypeScript, pruebas unitarias y build de producción aprobados.
- Flujo de crear/editar/borrar, reportar y convertir comprobado.
- Guardar sin señal, recargar, reconectar y comprobar ausencia de duplicados.
- Comprobar dos dispositivos y resolución de conflictos.
- Exportar/importar respaldo con archivos.
- Revisar modo claro/oscuro, contraste y ausencia de desbordamiento móvil.
- Verificar instalación y modo avión en Android/iPhone físicos desde la URL final.
- Completar datos reales de vuelos y hospedaje.
- Comprobar despliegue y Neon de producción cuando Axel los configure.

No confundir emulación de navegador con prueba física ni un build local con despliegue. El estado ejecutado y los pendientes de aceptación se registran en [QA](docs/QA.md).

## 10. Documentación de referencia

- [README: instalación, módulos, comandos y Vercel](README.md)
- [Arquitectura y decisiones](docs/ARQUITECTURA.md)
- [QA y evidencia](docs/QA.md)
- [Operación y recuperación](docs/OPERACION.md)
- [Diseño aprobado](stitch_listo_para_viajar_pwa/canada_explorer_heritage/DESIGN.md)

No agregar una segunda fase ni reintroducir presupuestos, roles o sincronización de imágenes sin una nueva decisión de Axel.
