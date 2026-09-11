# Especificación completa: App web del viaje a Toronto

Este documento contiene el contexto, alcance, requisitos funcionales, decisiones técnicas y criterios de aceptación para que un agente de desarrollo construya la aplicación completa del viaje. No se trata de un MVP al que después haya que agregar una segunda fase: todo lo descrito aquí forma parte del proyecto final para este viaje.

La aplicación debe ser una PWA mobile-first, desplegable completamente en Vercel, con datos sincronizados en Neon y fotos almacenadas localmente en cada celular.

---

## 1. Contexto del viaje

- Viajan el usuario, su hermano y su abuela.
- Es el primer viaje internacional del usuario y su hermano.
- Salida: lunes 14 de septiembre de 2026.
- Llegada a Toronto: martes 15 de septiembre de 2026, aproximadamente a las 6:00 a. m.
- Último día completo del viaje: jueves 24 de septiembre de 2026.
- Vuelo de regreso: viernes 25 de septiembre por la mañana.
- Llegada a Ecuador: viernes 25 de septiembre aproximadamente a las 8:00 p. m.
- Destino confirmado: Toronto, Canadá.
- Posible excursión de un día a Montreal, todavía no confirmada, organizada por familiares.
- No existe un itinerario fijo. Los familiares en Toronto los llevarán a algunos lugares y habrá días libres para decidir sobre la marcha.
- Todos los viajeros y familiares que consulten la aplicación son mayores de edad.
- Todos los usuarios pueden editar toda la información. En la práctica, probablemente una persona registrará la mayoría de los datos y los demás principalmente los consultarán.
- Los padres también deben poder consultar los cambios en las cuentas y los gastos.
- País de origen: Ecuador.
- Moneda de referencia de la familia: USD.
- Moneda utilizada en Canadá: CAD.
- La tasa del conversor es referencial y no necesariamente coincide con la tasa aplicada por una tarjeta, banco o casa de cambio.

La aplicación debe ayudar a organizar el viaje, registrar gastos de forma confiable, conservar comprobantes y permitir justificar posteriormente en qué se utilizó el dinero.

---

## 2. Objetivo del producto

Construir una aplicación web instalable como PWA, optimizada exclusivamente para celulares, que funcione con conectividad intermitente y sincronice la información entre los dispositivos de la familia.

Debe permitir:

1. Organizar el equipaje de cada viajero.
2. Registrar compras y regalos, indicando para quién son.
3. Registrar y consultar todos los gastos del viaje.
4. Convertir CAD a USD y USD a CAD rápidamente.
5. Guardar fotos locales de lugares, recibos, comprobantes y productos.
6. Guardar ideas para días libres en Toronto, Montreal u otras ciudades.
7. Consultar vuelos, hospedaje, contactos y otra información importante.
8. Generar reportes y estadísticas para revisar los gastos al regreso.
9. Permitir que toda la familia vea los cambios sincronizados.

---

## 3. Requisitos generales

- Mobile-first: la aplicación se diseña primero para pantallas pequeñas.
- PWA instalable desde Android y iOS.
- Despliegue completo en Vercel.
- Base de datos en Neon Postgres.
- Todas las personas pueden editar todos los módulos.
- La información textual y numérica se sincroniza con Neon.
- Las fotos no se suben al servidor: se guardan localmente en el dispositivo que las tomó o adjuntó.
- La aplicación debe indicar claramente cuándo los cambios están sincronizados o pendientes.
- El funcionamiento offline debe ser parte del producto terminado, no una mejora opcional.
- Debe evitarse la pérdida de datos al cerrar la aplicación, recargarla o quedarse temporalmente sin internet.
- La interfaz debe usar botones grandes, navegación inferior y acciones rápidas accesibles con el pulgar.
- Incluir modo claro y modo oscuro, con detección automática del tema del dispositivo y posibilidad de cambiarlo manualmente.

---

## 4. Módulos funcionales

### 4.1 Resumen del viaje

La pantalla inicial debe mostrar de forma rápida:

- Estado del viaje: antes del viaje, en Canadá o viaje finalizado.
- Contador hasta la salida antes del viaje.
- Contador hasta el regreso durante el viaje.
- Días restantes o días transcurridos.
- Destino principal: Toronto.
- Aviso visible de que Montreal es una posibilidad no confirmada.
- Total gastado hasta el momento.
- Presupuesto restante, si se configuró.
- Estado de sincronización.
- Accesos rápidos para registrar gasto, abrir el conversor y agregar una compra.

Debe incluir una sección editable de información importante:

- Datos del vuelo de ida: aerolínea, número de vuelo, fecha, hora, aeropuerto y notas.
- Datos del vuelo de regreso.
- Dirección del hospedaje en Toronto.
- Contacto de emergencia local.
- Información adicional útil.

Los datos sensibles no deben mostrarse en el resumen completo si el usuario no los ha configurado; el formulario debe permitir dejarlos vacíos.

### 4.2 Lista de empaque

- Ítems con descripción, categoría, persona responsable y estado.
- Personas precargadas: usuario, hermano y abuela.
- Estados: pendiente y empacado.
- Filtro por persona, categoría y estado.
- Progreso general y progreso individual.
- Agregar, editar, marcar y eliminar ítems.
- Confirmación antes de eliminar.
- Categorías sugeridas: ropa, documentos, medicamentos, electrónicos, higiene, accesorios y otros.
- Posibilidad de agregar ítems personalizados.
- La lista debe seguir siendo usable sin conexión.

### 4.3 Compras y regalos

Cada registro debe permitir:

- Nombre o descripción del producto.
- Destinatario: mamá, papá, hermano, abuela, usuario u otro nombre libre.
- Precio estimado en CAD.
- Precio final en CAD, si cambia.
- Estado: pendiente, comprado o empacado.
- Prioridad: normal o importante.
- Notas.
- Fotos locales del producto, referencia, precio o tienda.
- Opcionalmente, vincular la compra con un gasto registrado.

La interfaz debe mostrar totales estimados y reales de compras, evitando contar dos veces un producto que ya se vinculó a un gasto.

### 4.4 Presupuesto y gastos

Este es uno de los módulos principales de la aplicación.

Cada gasto debe incluir:

- Fecha y hora.
- Descripción del gasto.
- Categoría: comida, transporte, compras, regalos, actividades, hospedaje, salud, otros.
- Monto en CAD.
- Equivalente aproximado en USD usando la tasa seleccionada.
- Persona que pagó: usuario, hermano, abuela, mamá, papá u otra.
- Método de pago: efectivo, tarjeta, débito, transferencia u otro.
- Nota opcional.
- Fotos locales de recibos o comprobantes.
- Estado de sincronización.

Funciones requeridas:

- Presupuesto máximo opcional en CAD.
- Presupuesto máximo opcional en USD.
- Total gastado en CAD.
- Equivalente aproximado en USD.
- Disponible restante.
- Desglose por categoría.
- Desglose por persona que pagó.
- Desglose por método de pago.
- Gastos por día.
- Gastos por rango de fechas.
- Búsqueda y filtros.
- Edición y eliminación de registros.
- Confirmación antes de eliminar.
- Registro de compras y regalos sin duplicar gastos.

#### Reportes

La aplicación debe permitir generar y descargar:

- CSV con todos los gastos.
- CSV filtrado por fecha, categoría o persona.
- Resumen imprimible o PDF.
- Reporte agrupado por categoría.
- Reporte agrupado por persona que pagó.
- Reporte diario del viaje.
- Resumen de presupuesto: total, disponible y porcentaje utilizado.

El reporte debe incluir la fecha de generación y advertir que los valores en USD son aproximados si se calcularon usando una tasa referencial.

### 4.5 Conversor CAD ⇄ USD

Debe ser bidireccional y estar disponible desde cualquier pantalla mediante un botón flotante o acción rápida.

Requisitos:

- Campo para ingresar CAD y ver USD.
- Campo para ingresar USD y ver CAD.
- Conversión bidireccional sin necesidad de cambiar de pantalla.
- Redondeo visible a dos decimales.
- Tasa CAD → USD y tasa USD → CAD coherentes entre sí.
- Actualización automática cuando exista internet.
- Almacenamiento local de la última tasa obtenida.
- Funcionamiento offline usando la última tasa disponible.
- Fecha y hora de la última actualización.
- Botón para actualizar manualmente.
- Posibilidad de introducir una tasa manual si la API no está disponible.
- Mensaje visible: “Tasa referencial; puede diferir de la tasa de tu banco o tarjeta”.

Se puede utilizar una API pública como Frankfurter u otra alternativa vigente. El agente debe comprobar la disponibilidad actual de la API, controlar errores, evitar bloquear la aplicación si falla y no asumir que la red estará disponible.

El módulo de gastos debe poder reutilizar el conversor para mostrar el equivalente aproximado en USD al registrar un monto en CAD.

### 4.6 Ideas y lugares para días libres

Cada idea debe incluir:

- Nombre del lugar o actividad.
- Ciudad: Toronto, Montreal u otra.
- Descripción.
- Estado: pendiente, considerada, realizada o descartada.
- Prioridad.
- Notas prácticas.
- Fotos locales de referencia.
- Opcionalmente, dirección, enlace externo o ubicación textual.

Las ideas de Montreal deben mostrar claramente que el destino todavía no está confirmado.

### 4.7 Fotos locales

Las fotos pueden asociarse a:

- Ideas de lugares y actividades.
- Recibos y comprobantes de gastos.
- Productos que se quieren comprar.
- Compras y regalos.
- Documentos o referencias del viaje, si el usuario decide usarlas.

Reglas:

- Ninguna foto se sube a Neon, Vercel ni otro servidor.
- Las fotos se guardan como blobs en IndexedDB del dispositivo.
- Cada foto debe tener un identificador local, fecha, nombre opcional y tipo de asociación.
- La aplicación debe generar miniaturas para no consumir memoria innecesariamente.
- Debe permitir agregar, visualizar y eliminar fotos locales.
- Debe mostrar que una foto existe únicamente en el dispositivo donde fue guardada.
- Si un registro sincronizado aparece en otro celular, sus fotos locales no deben mostrar una miniatura rota: debe aparecer un mensaje como “Foto disponible en otro dispositivo” o “No hay fotos locales en este dispositivo”.
- No se deben guardar referencias de fotos locales en Neon, porque sus identificadores no tienen significado en otros dispositivos.

### 4.8 Estadísticas

Incluir una pantalla de estadísticas con visualizaciones simples y legibles en celular:

- Gasto total acumulado.
- Gasto por día.
- Gasto por categoría.
- Gasto por persona que pagó.
- Gasto en compras y regalos.
- Comparación entre presupuesto y gasto real.
- Porcentaje de empaque completado.
- Cantidad de compras pendientes, compradas y empacadas.

Las estadísticas deben funcionar con los datos locales disponibles y actualizarse después de la sincronización.

---

## 5. Arquitectura técnica

### 5.1 Despliegue

El proyecto debe poder desplegarse completamente en Vercel:

- Frontend y rutas de servidor en Next.js.
- Variables de entorno configuradas en Vercel.
- No depender de un servidor separado.
- Neon como base de datos externa.
- API pública de tasas de cambio consumida desde una ruta de servidor o desde el cliente según sus restricciones.
- Los archivos de la PWA deben servirse correctamente desde Vercel mediante HTTPS.

### 5.2 Frontend

Tecnología recomendada:

- Next.js con App Router.
- React y TypeScript.
- Tailwind CSS u otra solución sencilla de estilos.
- Drizzle ORM para Neon.
- IndexedDB, preferentemente mediante `idb`, para datos locales y fotos.
- Librería de gráficos liviana y compatible con móvil para estadísticas.

La aplicación debe incluir:

- `manifest.json`.
- Íconos para Android y iOS.
- `display: standalone`.
- Service worker.
- Caché del shell de la aplicación.
- Manejo de actualizaciones del service worker.
- Instalación comprobada en Android Chrome y iOS Safari.
- Navegación inferior con secciones: resumen, gastos, compras, empaque y más.
- Botones táctiles de al menos aproximadamente 44 px.
- Modo claro, oscuro y automático.

### 5.3 Neon y modelo de datos

El esquema puede ajustarse durante la implementación, pero debe conservar estas entidades y capacidades:

```sql
create extension if not exists pgcrypto;

create table trip_info (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create table packing_items (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  person text not null,
  category text,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table purchase_items (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  recipient text not null,
  estimated_price_cad numeric(12,2),
  final_price_cad numeric(12,2),
  status text not null default 'pendiente',
  priority text not null default 'normal',
  notes text,
  linked_expense_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table budget_entries (
  id uuid primary key default gen_random_uuid(),
  spent_at timestamptz not null,
  description text not null,
  category text not null,
  amount_cad numeric(12,2) not null,
  exchange_rate numeric(12,6),
  amount_usd_approx numeric(12,2),
  paid_by text not null,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table budget_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create table idea_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  description text,
  status text not null default 'pendiente',
  priority text not null default 'normal',
  notes text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table exchange_rate_cache (
  id integer primary key default 1,
  cad_to_usd numeric(12,6) not null,
  source text,
  updated_at timestamptz not null
);
```

La relación de las fotos debe mantenerse en IndexedDB, no en Neon. El modelo compartido debe guardar únicamente texto y números.

El servidor debe utilizar `@neondatabase/serverless` desde rutas o funciones de servidor. El connection string nunca debe exponerse al navegador.

### 5.4 Sincronización

La sincronización entre dispositivos es un requisito central.

La aplicación debe:

- Leer primero desde el almacenamiento local para abrir rápido.
- Consultar Neon cuando exista conexión.
- Guardar localmente cada cambio antes de enviarlo al servidor.
- Enviar automáticamente los cambios pendientes cuando vuelva internet.
- Mostrar la fecha de última sincronización.
- Mostrar operaciones pendientes y errores de sincronización.
- Usar operaciones idempotentes para que un reintento no duplique registros.
- Utilizar `updated_at` y eliminación lógica para sincronizar cambios y eliminaciones.
- Permitir refrescar manualmente.
- Mantener los cambios realizados por cualquiera de los usuarios.

Como todos pueden editar todo y normalmente no editarán simultáneamente el mismo registro, puede utilizarse una estrategia sencilla de “última actualización válida”. Si existe conflicto, debe conservarse una versión coherente y mostrar una advertencia en vez de perder silenciosamente datos.

Los datos compartidos son: gastos, configuración, empaque, compras, ideas e información del viaje. Las fotos son siempre locales al dispositivo.

### 5.5 Autenticación y privacidad

El proyecto no necesita un sistema de usuarios complejo. Se puede usar un acceso compartido sencillo o un enlace privado, porque se trata de una aplicación familiar de uso limitado.

Sin embargo, el agente debe:

- Evitar indexación en buscadores.
- Mantener el connection string de Neon solo en variables de entorno.
- No incluir secretos en el código del cliente.
- Mostrar y editar todos los datos con los mismos permisos.

No se requiere separación de permisos por usuario ni roles administrativos.

---

## 6. Offline y almacenamiento local

Debe funcionar correctamente cuando el celular tenga mala señal o pierda la conexión.

El almacenamiento local debe conservar:

- Última copia conocida de los datos sincronizados.
- Operaciones pendientes de envío.
- Última tasa de cambio.
- Fotos locales y sus metadatos.
- Preferencia de tema claro/oscuro/automático.

Cuando la conexión vuelva, la aplicación debe sincronizar sin obligar al usuario a recargar manualmente. Si una operación falla, debe permanecer pendiente y mostrar el motivo, con opción de reintentar.

---

## 7. Datos iniciales

Precargar o dejar disponibles para seleccionar:

- Personas: usuario, hermano, abuela, mamá, papá y otro.
- Ciudades: Toronto, Montreal y otra.
- Categorías de gastos: comida, transporte, compras, regalos, actividades, hospedaje, salud y otros.
- Métodos de pago: efectivo, tarjeta, débito, transferencia y otro.
- Estados de compra: pendiente, comprado y empacado.
- Estados de idea: pendiente, considerada, realizada y descartada.
- Fechas del viaje: 14 al 25 de septiembre de 2026.
- Destino confirmado: Toronto.
- Destino tentativo: Montreal.
- Monedas: CAD y USD.

---

## 8. Criterios de aceptación

La aplicación se considera terminada cuando:

- Se puede instalar como PWA en Android y iOS.
- Se puede utilizar cómodamente con una sola mano.
- Se puede registrar un gasto sin conexión y verlo posteriormente en otro dispositivo después de sincronizar.
- Los gastos no desaparecen al cerrar o recargar la aplicación.
- Se pueden adjuntar y consultar localmente fotos de recibos, comprobantes y productos.
- Las fotos no se suben a Neon ni se rompen los registros compartidos.
- El conversor funciona en CAD → USD y USD → CAD, con y sin conexión.
- Se pueden consultar totales, filtros, estadísticas y reportes exportables.
- Se puede controlar el presupuesto restante.
- Se puede administrar el equipaje, compras, regalos e ideas.
- Todos los usuarios pueden editar y consultar la información.
- Se muestra claramente el estado de sincronización.
- Existe modo claro y modo oscuro.
- La aplicación está desplegada y funcionando completamente en Vercel.
- Las variables de entorno y la conexión con Neon están documentadas.

---

## 9. Orden recomendado de implementación

Todo debe quedar listo antes del viaje. El orden sugerido es:

1. Crear el proyecto Next.js, TypeScript y estilos mobile-first.
2. Configurar Vercel, variables de entorno y conexión con Neon.
3. Crear el esquema y las migraciones de la base de datos.
4. Implementar la capa local con IndexedDB.
5. Implementar sincronización y estados offline desde el principio.
6. Configurar PWA, manifest, service worker e instalación móvil.
7. Implementar resumen e información del viaje.
8. Implementar gastos, presupuesto, comprobantes y reportes.
9. Implementar conversor CAD/USD online y offline.
10. Implementar compras y regalos.
11. Implementar lista de empaque.
12. Implementar ideas, lugares y fotos locales.
13. Implementar estadísticas y modo oscuro.
14. Probar sincronización con varios celulares y cambios realizados sin conexión.
15. Probar instalación, exportación de reportes, recuperación ante errores y despliegue final en Vercel.

La prioridad no es crear una demo visual, sino una herramienta confiable para usar durante todo el viaje y revisar las cuentas al regresar.

---

## 10. Diseño aprobado y handoff de Stitch

La carpeta `stitch_listo_para_viajar_pwa/` contiene el prediseño visual aprobado como referencia para la implementación. El sistema se identifica como **Canada Explorer Heritage** y la aplicación se presenta al usuario como **Listo Para Viajar**.

### 10.1 Prototipos disponibles

Los prototipos exportados por Stitch son:

- `resumen_del_viaje/`: pantalla principal y estado general del viaje.
- `control_de_gastos/`: total acumulado, listado de gastos, filtros y reportes.
- `nuevo_gasto/`: formulario para registrar un gasto.
- `conversor_cad_usd/`: conversor bidireccional CAD ⇄ USD.
- `listo_para_viajar_logo/`: propuesta de logo.

Estos archivos son referencias visuales, no deben copiarse directamente como código de producción. El HTML exportado utiliza Tailwind desde CDN, fuentes remotas y URLs temporales de imágenes; la aplicación final debe usar dependencias instaladas y recursos locales o estables.

### 10.2 Identidad visual aprobada

Mantener la siguiente dirección visual:

- Rojo arce como color de acción principal: aproximadamente `#C8102E`.
- Rojo oscuro para estados activos o de mayor contraste.
- Verde bosque para confirmaciones y elementos completados.
- Azul marino profundo para títulos, navegación y elementos estructurales.
- Fondo crema cálido para la superficie principal.
- Ámbar para pendientes, alertas y elementos que requieren atención.
- Tipografía principal: Plus Jakarta Sans, o una alternativa local visualmente equivalente.
- Tarjetas redondeadas, botones táctiles grandes y etiquetas en forma de píldora.
- Navegación inferior en celular.
- Aplicación de safe areas para dispositivos con notch y navegación gestual.
- Modo claro y oscuro respetando la misma identidad visual.

### 10.3 Componentes visuales que deben conservarse

- Encabezado con logo, nombre de la aplicación y estado de sincronización.
- Tarjetas de resumen con jerarquía fuerte para los totales.
- Indicadores de estado: sincronizado, sin conexión, pendiente y completado.
- Acciones rápidas para registrar gastos, abrir el conversor, revisar documentos y ver equipaje.
- Navegación inferior: Resumen, Gastos, Compras, Equipaje y Más.
- Botón o acceso persistente al conversor CAD ⇄ USD.
- Formularios con campos altos, controles grandes y categorías visuales con iconos.
- Línea visual de conexiones para Manta → Quito → Colombia → Toronto y el regreso.
- Tarjetas de documentos y checklist con progreso.
- Estados vacíos y mensajes de confirmación amigables.

### 10.4 Datos que deben corregirse durante la implementación

Los números mostrados en los prototipos son datos de demostración y no deben convertirse en datos reales:

- El contador “192 días” debe calcularse dinámicamente usando la fecha actual y el 14 de septiembre de 2026.
- El total de gastos mostrado en el diseño debe iniciar en cero si la base de datos no tiene registros.
- “15 registros totales”, “37%” y los montos de ejemplo deben ser calculados desde Neon y el almacenamiento local.
- Los vuelos, aeropuertos, horarios y códigos que todavía no estén confirmados deben aparecer como pendientes o vacíos.
- La pantalla no debe presentar un presupuesto inicial ni una meta de gasto.
- La ruta debe usar los nombres confirmados: Manta, Quito, Colombia y Toronto. El aeropuerto o ciudad exacta de Colombia queda editable hasta confirmar los boletos.
- Los nombres iniciales son Axel Hernández Menéndez, Sebastián Hernández Menéndez y Sumba Abuelita. La interfaz puede mostrar versiones cortas como Axel, Sebastián y Abuelita, pero los nombres completos deben estar disponibles en los datos.

### 10.5 Funciones visuales que requieren decisión de producto

El archivo `DESIGN.md` propone algunos componentes adicionales que no deben implementarse automáticamente sin datos o una decisión explícita:

- Clima de Toronto.
- Cálculo de propinas.
- Cálculo de HST de Ontario.
- Enlaces directos a Google Maps o Apple Maps.
- Barra rápida del consulado ecuatoriano y emergencias.
- Integración con TTC o UP Express.

Pueden conservarse como espacio visual o componentes futuros, pero la implementación inicial debe centrarse en las funciones confirmadas de gastos, conversor, documentos, equipaje, compras, fotos locales, sincronización y reportes.

### 10.6 Reglas para imágenes y recursos

- El logo final debe guardarse como recurso local dentro del proyecto, preferentemente SVG o PNG optimizado.
- No depender de las URLs `lh3.googleusercontent.com` generadas por Stitch.
- No depender de `cdn.tailwindcss.com` en producción.
- Las fuentes pueden instalarse como dependencia o cargarse mediante una estrategia estable de producción.
- Las fotos de usuario deben usar IndexedDB y nunca las URLs remotas de los prototipos.
- `screen.png` sirve para comparar visualmente la implementación durante la revisión.

### 10.7 Referencia de implementación

El agente debe construir componentes reutilizables a partir del sistema de diseño, no cinco páginas aisladas. Como mínimo, crear componentes para:

- App shell y navegación.
- Encabezado y estado de sincronización.
- Tarjetas, botones, badges y campos de formulario.
- Selector de moneda.
- Tarjeta de gasto.
- Adjuntos de fotos locales.
- Checklist y progreso.
- Línea de ruta.
- Modal o bottom sheet del conversor.
- Estados vacíos, carga, error y modo offline.

La implementación debe preservar la intención visual de Stitch, pero los datos, estados, cálculos, sincronización y formularios deben ser reales y funcionar con Neon e IndexedDB.
