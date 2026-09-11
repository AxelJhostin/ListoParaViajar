# Arquitectura y decisiones

## Objetivo

Conservar cada anotación del viaje y ofrecer una interfaz coherente, fácil de modificar y mantenible. Se separan dominio, persistencia local, servicios de servidor y presentación. La escala objetivo es una familia; la estructura admite más módulos sin introducir una plataforma multitenant innecesaria.

## Dependencias entre capas

```text
Páginas Next.js → features → componentes compartidos
                         ↘ TripProvider → localDB / sync / attachments / backup
                                             ↓ HTTP JSON
                                       /api/sync → sync-service → Drizzle → Neon
Dominio (Zod y dinero) es compartido por cliente y servidor.
/api/rate → Frankfurter → tasa local → copia histórica en cada gasto.
```

La UI nunca importa `server/db`. Las credenciales se leen únicamente al abrir conexiones del servidor. La compilación puede completarse sin una conexión activa a la base.

## Registro sincronizable

`TripRecord` contiene `id`, `kind`, `data`, `version`, `updatedAt`, `deleted`. Los UUID se generan en el cliente, antes de conectarse. `kind` selecciona el esquema Zod de su contenido. Los tipos discriminados lógicamente por módulo facilitan nuevos formularios sin crear rutas de sincronización independientes.

Se reemplazó el SQL preliminar de muchas tablas por una tabla de registros con payloads tipados, más una tabla de confirmaciones. Es una decisión para este volumen y este patrón de sincronización, no un esquema genérico sin validación. Los campos monetarios se expresan en centavos; solo la tasa usa decimal de referencia. Las restricciones SQL mantienen versión positiva y módulos permitidos.

El índice por módulo/estado y las columnas de control permiten evolucionar a paginación y consultas por módulo. A escala mayor, extraer tablas especializadas para gastos, vínculos con FK y agregaciones SQL. Actualmente se descarga una fotografía completa de todos los registros, incluidas eliminaciones lógicas, cada 15 segundos con la app visible. Eso es intencional para un viaje pequeño; no prometer escala ilimitada ni “tiempo real” instantáneo.

## Protocolo de sincronización

`GET /api/sync` devuelve `{ records, serverTime }` y `Cache-Control: no-store`.

`POST /api/sync` recibe:

```json
{
  "opId": "uuid-de-la-operacion",
  "baseVersion": 1,
  "record": {
    "id": "uuid-del-registro",
    "kind": "expense",
    "data": {},
    "version": 1,
    "updatedAt": "fecha-del-cliente",
    "deleted": false
  }
}
```

El `data` del ejemplo se completa según el esquema del módulo; no es un gasto válido por sí mismo.

El servidor valida tamaño y estructura, inicia una transacción y bloquea lógicamente el UUID del registro. Busca primero el recibo de `opId`: si ya existe devuelve la respuesta guardada, sin reinsertar ni volver a incrementar versión. Luego compara `baseVersion` con la versión actual, asigna una versión nueva y la fecha del servidor, guarda el registro y su confirmación en la misma transacción.

Resultados: 200 confirmado; 409 conflicto con versión compartida; 400 validación; 413 demasiado grande; 503 servicio no disponible. Un error no retira la operación local. Las API no devuelven conexiones ni errores SQL completos al cliente.

## Cola local y concurrencia

IndexedDB tiene cuatro stores: registros, outbox, fotos y metadatos. Guardar un registro y su operación es una sola transacción. Outbox mantiene la última edición pendiente por registro. Web Locks impide que dos pestañas envíen la misma cola al mismo tiempo; los mensajes BroadcastChannel refrescan sus vistas.

Un envío puede tardar mientras el usuario vuelve a editar. La confirmación solo retira una operación si el `opId` coincide con el que se envió. Si hay otra edición, se actualiza su versión base y se conserva para el próximo envío. Las descargas remotas nunca pisan un registro con cambios locales pendientes.

Los relojes de los teléfonos no deciden qué versión gana. En caso de cambios simultáneos, Ajustes muestra la copia local y la compartida y permite escoger. Los borrados son tombstones; un teléfono que estuvo offline no resucita automáticamente un registro eliminado.

## Fotos y respaldo

Los registros compartidos no contienen referencias de imágenes. La asociación `recordId` existe exclusivamente en el store local de adjuntos. Los gastos se guardan antes de abrir el panel de archivos; un error de imagen no pierde el gasto. Borrar un registro no borra en cascada su foto local: sigue disponible en el respaldo completo, para evitar pérdida involuntaria de comprobantes.

Los adjuntos se guardan como ArrayBuffer con metadatos, reconstruyendo Blob al leer; también se leen registros Blob anteriores. La conversión ocurre antes de abrir una transacción de escritura, para no dejar que IndexedDB la cierre entre operaciones asíncronas. Esto evita el fallo de guardado Blob observado en WebKit.

El respaldo ZIP contiene `backup.json` y bytes de adjuntos con UUID. La importación valida tipos y límites y agrega datos ausentes en una transacción. No ejecuta HTML ni inserta datos mediante `innerHTML`. Los PDF se abren como archivos del navegador, las imágenes se muestran con Object URLs que se liberan al desmontar.

## PWA

El build genera un service worker con identificador distinto por compilación. Precarga las doce rutas, sus JS/CSS/fuentes y los iconos. La navegación usa enlaces de documento para que una ruta nunca visitada pueda abrirse con el HTML precargado sin depender de un request React Server Components pendiente.

Los recursos estáticos y las doce rutas conocidas usan primero la caché de su compilación. Así una navegación offline es inmediata y no mezcla HTML nuevo con recursos de otra versión. Las rutas desconocidas intentan la red. `/api/*` queda fuera del service worker; la persistencia de datos corresponde a IndexedDB. Una versión nueva espera y muestra una acción para recargar; no borra stores locales.

Sin descarga inicial no existe soporte offline. Al cambiar de dominio cambian el service worker y los stores. Chrome/WebKit de escritorio no sustituyen una prueba de instalación en teléfonos físicos.

## Diseño

Se conserva la exportación Stitch completa. Los componentes comparten variables semánticas de color, radios, espacios y tipografía en `globals.css`. La variante oscura cambia los tokens, no los datos. Los iconos SVG son locales; no requieren una fuente de iconos remota. El logo es el SVG suministrado por Stitch y sus PNG se generan con Sharp.

Los formularios usan controles HTML con labels, `inputmode=decimal`, foco visible y diálogos nativos modales. La navegación mantiene safe areas. Los gráficos usan barras simples acompañadas por valores textuales, sin información exclusiva del color.

## Agregar un módulo

1. Definir esquema y valores iniciales en `domain/models.ts`.
2. Incluir el nuevo `kind` y ajustar la restricción SQL con migración Drizzle.
3. Crear feature propia o configuración en `features/collections/config.ts`.
4. Agregar ruta y acceso de navegación; incluirla en el precache.
5. Agregar pruebas de dominio, CRUD, offline y presentación.
6. Actualizar README, especificación y operación.

Para cambios incompatibles de IndexedDB, incrementar versión con migración que preserve registros, pendientes y adjuntos. No usar `deleteDatabase` como actualización de app.
