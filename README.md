# Listo Para Viajar 🍁

Bitácora familiar para el viaje **Manta → Quito → Bogotá → Toronto**, del 14 al 25 de septiembre de 2026. Aplicación web instalable, pensada para celulares, con registros compartidos en Neon y adjuntos que permanecen en cada dispositivo.

El diseño se basa en la exportación de Google Stitch aprobada por Axel, `Canada Explorer Heritage`: fondos crema, rojo arce, verde bosque, tarjetas redondeadas y tipografía Plus Jakarta Sans.

## Empezar en local

Requisitos: Node.js 22 o superior, npm y las conexiones pooled/direct de un proyecto Neon. Usar la versión del archivo `.nvmrc` para un entorno reproducible.

```bash
npm ci
cp .env.example .env.local
```

Completar `.env.local` con conexiones válidas. Si ya existe, **conservarlo**: el entorno de trabajo entregado ya tiene una conexión de desarrollo configurada. No ejecutar el `cp` sobre ese archivo sin guardar sus valores.

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.neon.tech/neondb?sslmode=verify-full
DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=verify-full
```

```bash
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

Abrir [localhost:3000](http://localhost:3000). Las credenciales permanecen en el servidor; `.env.local` está excluido de Git. Las migraciones no se ejecutan automáticamente al iniciar o compilar la app.

Para comprobar la PWA y el funcionamiento sin internet se necesita una compilación de producción:

```bash
npm run build
npm run start
```

Detener previamente cualquier servidor que ocupe el puerto 3000. El service worker se registra solo en producción para evitar cachés obsoletas durante el desarrollo.

## Lo que incluye

| Pantalla     | Funciones                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Resumen      | Cuenta regresiva real, fechas, ruta, viajeros, progreso y accesos rápidos                             |
| Modo Hoy     | Próximo vuelo, acción recomendada, checklist inteligente y relojes de tres ciudades                   |
| Gastos       | Crear, editar, eliminar, buscar, filtros de fecha/categoría/persona/método/moneda/adjuntos; CAD y USD |
| Conversor    | CAD ⇄ USD, tasa automática, última tasa offline, tasa manual y montos rápidos                         |
| Equipaje     | Ida/regreso, responsable, categoría, cantidad, notas, estado y progreso                               |
| Compras      | Destinatario, precio estimado/final, prioridad, estado y vínculo opcional con un gasto                |
| Documentos   | Lista por viajero y etapa, pendiente/revisado/listo, vencimiento, notas y adjuntos                    |
| Ruta         | Seis vuelos, temporizador, avisos locales, salida recomendada, márgenes editables y terminales        |
| Emergencia   | Vista offline imprimible y descarga TXT con vuelos, contactos y estado documental                     |
| Diario       | Recuerdos compartidos por fecha, ciudad y ánimo; notas y fotografías locales                          |
| Información  | Hospedaje, contacto local, seguro y otros datos agregables después                                    |
| Días libres  | Ciudad, prioridad, dirección, enlace, notas y estado; Montreal marcado como tentativo                 |
| Estadísticas | Gastos por categoría, día, persona y método; progreso de equipaje/documentos/compras                  |
| Reportes     | CSV, impresión/PDF, filtros, agrupaciones y recibos locales opcionales                                |
| Ajustes      | Claro/oscuro/automático, sincronización, conflictos, respaldo ZIP, importación, instalación           |

No hay presupuesto inicial, meta de ahorro ni tope: se registran gastos y se consulta su acumulado. El resumen final utiliza esos mismos registros. No se suma dos veces una compra: **solo los registros de Gastos forman los totales contables**. Marcar un producto como comprado no crea un gasto automáticamente.

Todos los familiares tienen los mismos permisos; mamá y papá pueden consultar las cuentas desde la misma dirección. No hay registro de usuarios ni roles. Por decisión del proyecto, la URL compartida tiene acceso de lectura y escritura; `noindex` evita solicitar indexación, pero no es un sistema de autenticación.

## Datos iniciales y pendientes

El seed es repetible: usa UUID estables y `ON CONFLICT DO NOTHING`, por lo que no modifica entradas existentes ni vuelve a crear datos eliminados lógicamente.

- Viajeros de referencia: Axel Hernández Menéndez, Sebastián Hernández Menéndez y Sumba Abuelita.
- Salida de Manta: 14 de septiembre de 2026.
- Llegada a Toronto: 15 de septiembre, 07:20 hora local (Avianca AV254).
- Regreso a Manta: 25 de septiembre, 20:10 hora local (Avianca AV1696).
- Seis trayectos de ida/regreso.
- Doce registros iniciales de documentos, todos pendientes de revisión.
- Cuatro campos de información vacíos: hospedaje, emergencia, seguro y notas.
- Cero gastos, cero compras y cero artículos de equipaje inventados.

La conexión confirmada es Bogotá (El Dorado, Terminal 1 en los tramos indicados); los seis vuelos, aeropuertos y horarios se precargan desde el boleto de Axel. Se debe confirmar que Sebastián y Sumba viajen en los mismos vuelos. El hospedaje se completa desde la interfaz. Las listas de documentos son organización personal; no se precargan supuestos permisos migratorios. Montreal sigue sin confirmar.

Cada vuelo calcula su instante real desde la fecha, hora local y zona IANA del aeropuerto de salida. El margen inicial es 120 minutos en Manta, 180 minutos en Toronto y 45 minutos para estar en la puerta durante conexiones. Todos son editables. Cuando se agrega la duración del traslado, la app calcula también a qué hora salir del alojamiento.

## Arquitectura y organización

```text
src/
  app/                 Páginas de Next.js y endpoints /api
  components/          AppShell, navegación, formularios, modal, adjuntos, estado compartido
  domain/              Tipos, validación Zod, dinero y datos iniciales
  features/
    dashboard/         Resumen y contexto del viaje
    today/             Centro de mando, checklist contextual y relojes locales
    itinerary/         Temporizadores, conexiones y confirmación de pasajeros
    emergency/         Paquete offline imprimible y descargable
    expenses/          Formulario y listado de gastos
    collections/       Formularios/listas configurables por módulo
    converter/         Conversor accesible desde todas las pantallas
    reports/           Estadísticas, CSV y vista imprimible
    settings/          Tema, respaldo, conflictos y sincronización
  local/               IndexedDB, cola de operaciones, fotos, backups y sincronización
  server/              Servicios y conexión exclusivamente del servidor
    db/                Esquema Drizzle y pool PostgreSQL
drizzle/               Migraciones SQL y metadatos versionados
scripts/               Migración, seed, chequeo, iconos y generación del service worker
public/                Logo, iconos, manifest y robots
tests/unit/            Dinero, validación, CSV y comportamiento de la cola
tests/e2e/             Pruebas Playwright en Chromium y WebKit
docs/                  Arquitectura, QA, operación y decisiones
stitch_listo_para_viajar_pwa/  Referencia visual original, conservada
```

Los módulos no consultan PostgreSQL desde componentes. `domain` no depende de React ni del servidor; `local` guarda datos durables; las rutas API validan y delegan a servicios. El formulario de gasto es específico para facilitar el ingreso de dinero. Los módulos tipo lista comparten componentes y una configuración de campos para conservar consistencia.

Stack instalado y fijado en `package-lock.json`: Next.js 16, React 19, TypeScript, Drizzle, `pg`, IndexedDB mediante `idb`, Zod, Lucide y CSS con variables semánticas. La tipografía se sirve localmente mediante Fontsource. No hay dependencias de Tailwind CDN ni de imágenes temporales de Stitch en producción.

La estructura permite agregar módulos y pruebas sin mezclar persistencia, UI y reglas de negocio. No pretende ser una plataforma multiviaje: el alcance es una familia y un viaje. Los límites y la evolución posible están documentados en [arquitectura](docs/ARQUITECTURA.md).

## Modelo de datos y sincronización

PostgreSQL tiene dos tablas administradas con Drizzle:

- `trip_records`: UUID, módulo (`kind`), contenido tipado y validado (`data` JSONB), versión, eliminación lógica y hora del servidor.
- `sync_operations`: identificador de operación y respuesta persistida para hacer los reintentos idempotentes.

JSONB contiene texto, números y estados; **no contiene fotos, blobs, base64 ni identificadores locales de adjuntos**. Cada módulo tiene un esquema Zod. La versión vive como columna consultable; `kind/deleted` tiene índice.

Flujo al guardar:

1. Se valida el registro.
2. Una transacción IndexedDB guarda el registro y su operación pendiente.
3. La interfaz confirma almacenamiento local.
4. La API procesa la operación en una transacción PostgreSQL.
5. Solo tras recibir la respuesta se retira de la cola la operación confirmada.
6. Se descargan los registros compartidos, conservando los cambios locales pendientes.

La sincronización se intenta al abrir, guardar, recuperar conexión, volver a la pestaña y cada 15 segundos mientras la app está visible. Las pestañas del mismo navegador se coordinan con Web Locks y BroadcastChannel. Los registros con conflictos permanecen disponibles y se resuelven en Ajustes comparando ambas versiones.

El teléfono puede suspender aplicaciones en segundo plano. La sincronización no está garantizada con la PWA cerrada: basta abrirla con internet para reintentar. La primera apertura necesita conexión para descargar la app; la primera copia compartida requiere que Neon responda.

## Temporizadores y avisos de vuelo

Ruta y vuelos muestra una cuenta regresiva en vivo y la hora recomendada para llegar al aeropuerto o estar en la puerta. Los avisos se disparan a las 24 horas, 6 horas, 1 hora y 15 minutos. Cada umbral se registra localmente para evitar repeticiones.

Los avisos dentro de la app funcionan mientras esta siga abierta. Si el navegador permite notificaciones y el usuario concede permiso, se muestra además un aviso del dispositivo. No hay proveedor de push ni tarea remota: el sistema operativo puede suspender el navegador, así que **no se garantiza ningún aviso con la aplicación completamente cerrada**. Deben conservarse también las alarmas o recordatorios habituales del teléfono.

## Dinero y tasa de cambio

- Los importes originales se guardan como centavos enteros, evitando errores al sumar decimales.
- CAD y USD se distinguen siempre; se aceptan punto o coma decimal, sin separadores de miles.
- Cada gasto guarda la moneda original y una copia de la tasa utilizada con fuente y fecha.
- Actualizar la tasa del conversor no cambia gastos históricos.
- Cuando falta tasa, el gasto se conserva en su moneda original. Un total convertido indica cuántos gastos no pudo incluir.
- El usuario puede editar un gasto y elegir explícitamente usar la tasa disponible.
- La tasa automática viene de Frankfurter; se consulta desde el servidor y se almacena localmente. No es una cotización en tiempo real de tarjetas ni bancos.

El CSV incluye monto original, equivalentes, tasa, fecha, fuente, persona, método y notas. Se escapan comillas y se neutralizan celdas que puedan interpretarse como fórmulas en una hoja de cálculo.

## Adjuntos, almacenamiento y respaldos

Se aceptan imágenes y PDF de hasta 15 MB por archivo. Las imágenes se convierten a JPEG de máximo 1800 px en su lado mayor. Se preserva la legibilidad del recibo; los PDF mantienen su archivo original. El navegador debe poder decodificar el formato de imagen elegido.

Los archivos se guardan en IndexedDB y solo se ven en ese navegador/origen. Otro celular mostrará “No hay adjuntos locales en este dispositivo”; no puede saber si existe una foto en otro teléfono porque no se sincronizan metadatos de fotos.

Desde Ajustes se puede:

- Descargar un ZIP con todos los registros locales, tasa y adjuntos.
- Importar un ZIP de esta aplicación para agregar registros/adjuntos ausentes.
- Solicitar almacenamiento persistente al navegador; la concesión depende del navegador.

La importación **no sobrescribe registros ya existentes**. Los registros recuperados se encolan; si la nube ya tiene otro estado se mostrará un conflicto para resolverlo. La importación es transaccional y valida el contenido antes de modificar datos. Un CSV es un reporte, no una copia completa recuperable.

Cambiar el dominio, usar otro navegador, borrar datos del sitio o reinstalar en otro contexto puede dar un almacenamiento distinto. Guardar un respaldo antes de esos cambios. Los comprobantes no se guardan automáticamente en la galería del teléfono; existe una descarga explícita por archivo.

## QA y comandos

```bash
npm run lint          # Reglas de React, TypeScript y Next.js
npm run typecheck     # Tipos estrictos
npm test              # Pruebas unitarias de dominio y persistencia
npm run build         # Compilación de producción + precache de la PWA
npm run qa            # Los cuatro controles anteriores
npx playwright install chromium webkit
npm run test:e2e      # Flujos completos en Chromium móvil y WebKit móvil
```

Los E2E normales interceptan las APIs para usar datos aislados y reproducibles; no insertan recibos ficticios en Neon. El caso offline usa el service worker real. La verificación real de PostgreSQL y sus transacciones se registra por separado. La guía [QA](docs/QA.md) distingue pruebas ejecutadas de la validación pendiente en teléfonos físicos.

Última revisión: **34 pruebas unitarias, 27 E2E y 9 comprobaciones PostgreSQL aprobadas**, además de lint, tipos y build. La navegación offline WebKit/macOS tiene un `fixme` por un error reproducido también sin la app; **iPhone instalado y modo avión aún requieren comprobación física**. No se considera una prueba aprobada. CI está configurado, pero todavía no ejecutado en GitHub.

Para probar PostgreSQL real, configurar `.env.e2e.local` con las conexiones de una rama de QA, según la [guía de pruebas](docs/QA.md), y ejecutar `npm run test:db`. El script verifica rollback de sus datos. No utilizar producción.

Otros comandos:

```bash
npm run db:generate   # Crear una nueva migración a partir del esquema
npm run db:migrate    # Aplicar migraciones versionadas por conexión directa
npm run db:seed       # Agregar únicamente datos iniciales ausentes
npm run db:check      # Verificar conexión y conteos por módulo
npm run format       # Formatear código, pruebas y documentación
node scripts/icons.mjs # Regenerar los iconos desde el SVG de Stitch
```

## Preparación para Vercel

**El proyecto no se desplegó. El despliegue lo hará Axel.**

1. Publicar el código en el repositorio configurado `AxelJhostin/ListoParaViajar`.
2. Importar el repositorio en Vercel usando el preset Next.js y Node 22.
3. Configurar `DATABASE_URL` con la conexión pooled de la rama destinada al viaje.
4. Aplicar antes `db:migrate` y `db:seed` sobre esa rama usando su conexión directa en un entorno local controlado.
5. Usar `npm run build` como comando de build. Es importante conservarlo porque genera `public/sw.js` después de compilar.
6. Abrir la URL definitiva con internet, comprobar sincronización, instalarla y probarla sin señal.
7. Compartir la misma URL con la familia.

`DATABASE_URL_UNPOOLED` se usa para migraciones locales; no es necesaria en el navegador ni en el runtime si las migraciones se realizan antes. Nunca usar prefijo `NEXT_PUBLIC_` para conexiones. Una vista previa de Vercel debería apuntar a una rama de desarrollo, no a las cuentas reales.

No hacen falta Vercel Blob, cron, otro servidor ni almacenamiento remoto de fotos. Las API usan runtime Node con un pool pequeño; la integración `attachDatabasePool` administra las conexiones cuando corre en Vercel.

## Documentación y referencias

- [Especificación actual](contexto-app-viaje-toronto.md)
- [Arquitectura y decisiones](docs/ARQUITECTURA.md)
- [QA y matriz de pruebas](docs/QA.md)
- [Operación y resolución de problemas](docs/OPERACION.md)
- [Sistema visual original](stitch_listo_para_viajar_pwa/canada_explorer_heritage/DESIGN.md)
- [PWA con Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Drizzle y Neon](https://neon.com/docs/guides/drizzle)
- [API Frankfurter](https://frankfurter.dev/)

Los montos, porcentajes, aeropuertos y roles personales que aparecen en las capturas originales son ejemplos de Stitch. La app calcula métricas con datos reales y deja sin completar lo que todavía no se conoce.
