# Operación y resolución de problemas

## Entorno preparado

Repositorio remoto configurado: `https://github.com/AxelJhostin/ListoParaViajar.git`.

Proyecto Neon existente: `viaje` (`old-mud-16955601`). La implementación local utiliza `development-listo-para-viajar` (`br-round-lake-aytgvb4o`), creada a partir de la rama `production`. Esta última no se usa para los datos de pruebas. Las conexiones se mantienen en `.env.local`, que no debe compartirse ni versionarse.

La rama `qa-listo-para-viajar` (`br-little-recipe-ayargz7t`) está separada para verificaciones de base, con conexiones en `.env.e2e.local`. Las pruebas unitarias usan IndexedDB simulado y los E2E una API de prueba controlada. El script `test:db` verifica transacciones reales y revierte sus datos antes de terminar.

El código no está desplegado en Vercel. El README explica el procedimiento para que Axel lo despliegue. No se ejecutan migraciones de producción desde CI ni desde el build.

## Primer uso de la familia

1. Entrar por la URL definitiva con internet y esperar a que termine la sincronización.
2. Revisar Ruta y vuelos; agregar los datos de los boletos sin adivinar aeropuertos.
3. Revisar Documentos por viajero y por etapa.
4. Agregar hospedaje y contacto local en Información.
5. Actualizar el conversor y verificar que muestra fuente y fecha.
6. Instalar la PWA en cada teléfono y abrirla una vez con internet.
7. Hacer una prueba de modo avión antes del aeropuerto.
8. Descargar respaldo desde el celular que registra los comprobantes.

## Registrar una compra sin duplicarla

En Compras se anota la idea, destinatario y precio. Después de pagar, registrar el desembolso en Gastos. Editar la compra y vincularla con el gasto existente. Se puede vincular más de un producto al mismo recibo. El monto de compras sirve de referencia, pero no se suma al libro de gastos.

## No aparece un gasto en otro celular

- Verificar que ambos usen la misma URL y conexión a la misma rama Neon.
- En el celular que lo registró, abrir Ajustes y mirar cambios pendientes y mensajes de error.
- Pulsar Sincronizar ahora con internet.
- En el otro celular, volver a abrir la app o pulsar Sincronizar ahora.
- Si aparece un conflicto, comparar ambos contenidos y elegir una versión.
- Si falta `DATABASE_URL` o una tabla, corregir el servidor y aplicar migraciones; no borrar los datos locales.

## “Sincronizado” y app cerrada

La interfaz indica lo que logró confirmar. Los cambios guardados solo localmente permanecen pendientes. Los sistemas móviles suspenden pestañas/PWA; al abrir de nuevo con internet se reintenta. No es una aplicación con ejecución garantizada todo el día en segundo plano.

## Se perdió la señal al guardar

El registro y la operación ya estaban escritos en IndexedDB antes de la confirmación visual de guardado. Abrir la aplicación al reconectar. Los reintentos no generan una segunda copia del mismo gasto. Si el servidor recibió el cambio pero la respuesta se perdió, el UUID de operación recupera la misma confirmación.

## Fotos o comprobantes ausentes

Solo existen en el navegador donde se agregaron. No van a Neon ni se guardan automáticamente en la galería. Usar Descarga junto al archivo o respaldar con ZIP. Para verlos en otro dispositivo, llevar allí el ZIP e importarlo. No hay forma de recuperarlos desde Neon si se borró el navegador y no existe respaldo.

Una imagen HEIC u otro formato no decodificable puede fallar; tomar otra foto desde el selector de cámara o usar JPG/PNG/PDF. El mensaje de error del archivo no elimina el gasto ya guardado.

## La app sigue mostrando una versión anterior

Abrirla con internet. Si hay una nueva versión, guardar formularios abiertos y pulsar Actualizar en el aviso. Si hay un problema de service worker durante desarrollo, usar Application → Service Workers → Unregister en DevTools; conservar IndexedDB. No usar “Clear site data” sobre datos sin respaldo.

## El reporte no coincide con la suma esperada

Revisar filtros, moneda original, cantidad de gastos sin tasa y cambios sin sincronizar. Los gastos usan la tasa guardada cuando se registraron. El conversor usa la tasa actual: ambas cifras pueden diferir de forma esperada. Solo Gastos entra al total; una compra marcada como Comprada no es otro desembolso automático.

El PDF se obtiene con el diálogo de impresión del sistema. Los recibos se incluyen solo cuando se activa esa opción y son imágenes locales disponibles. Los PDF adjuntos se descargan aparte. El archivo CSV tiene todos los campos y se abre en hojas de cálculo con codificación UTF-8.

## Respaldo y recuperación

Descargar un ZIP antes de cambiar de navegador/dominio y al terminar el viaje. Importarlo agrega registros y adjuntos que no están en ese dispositivo; los registros ya presentes no se sobrescriben. Las diferencias con la nube se presentan como conflictos. Conservar el ZIP original hasta verificar las cuentas y comprobantes.

## Mantenimiento

- Cambiar la base mediante migraciones Drizzle revisadas en desarrollo.
- Ejecutar QA antes de cambiar el build publicado.
- Conservar `package-lock.json`; actualizar dependencias con revisión y pruebas.
- Evitar comandos destructivos de base y limpieza de IndexedDB.
- Revisar uso de Neon si hay muchos dispositivos abiertos: la app consulta cada 15 segundos mientras está visible.
- Tras el viaje, exportar las cuentas. No existe borrado automático programado.

## Límites deliberados

Una familia/un viaje; acceso compartido; adjuntos locales; tasas referenciales; polling con la app visible; reportes PDF por impresión; temporizadores y notificaciones locales mientras el navegador pueda ejecutar la app. No hay OCR, mapas offline, validación migratoria, pasarela de pagos, proveedor push externo, ejecución garantizada con la app cerrada, repartición de deudas ni itinerario turístico inventado.
