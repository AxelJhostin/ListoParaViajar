# QA y aceptación

Fecha de revisión: 11 de septiembre de 2026. Esta guía distingue controles automatizados, comprobaciones reales de base de datos y aceptación manual. No constituye una garantía de ausencia de errores ni una certificación de accesibilidad.

## Resultado de esta entrega

| Control                                | Resultado ejecutado                                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ESLint y TypeScript                    | Aprobados                                                                                             |
| Vitest                                 | 33 pruebas aprobadas, 5 archivos                                                                      |
| Build de producción                    | Aprobado; 12 rutas de aplicación precargadas y 71 recursos estáticos                                  |
| Playwright                             | 23 aprobadas; 1 `fixme` en WebKit/macOS, explicado más abajo                                          |
| Responsive                             | Las 12 rutas a 320 y 1280 px, en ambos motores; sin desbordamiento horizontal ni errores de ejecución |
| PostgreSQL real                        | 7 comprobaciones aprobadas y rollback verificado                                                      |
| Dependencias                           | `npm audit`: 0 vulnerabilidades conocidas en la revisión                                              |
| Migraciones                            | `db:generate`: sin diferencias; desarrollo conectado con datos iniciales                              |
| Vercel / teléfonos físicos / CI remoto | No ejecutados; pendientes de Axel y la URL definitiva                                                 |

## Entorno y ejecución

macOS ARM64, Node 25.9.0, Next.js 16.3.4, Playwright 1.63.0. El proyecto fija Node 22 en `.nvmrc` para desarrollo reproducible y CI. Se probaron Chromium con perfil Pixel 7 y WebKit con perfil iPhone 13; son navegadores automatizados, **no teléfonos físicos**.

```bash
npm ci
npm run qa
npx playwright install chromium webkit
npm run test:e2e
```

`qa` ejecuta lint, TypeScript, Vitest y build. El build genera el service worker y su precache. Los E2E requieren ese build y levantan/detienen su propio servidor en el puerto 3000. No iniciar otro servidor en ese puerto durante las pruebas.

Los escenarios normales bloquean service workers e interceptan la API con un servidor simulado compartido cuando corresponde. Así los datos de prueba no terminan en Neon y el estado de cada escenario es repetible. La prueba PWA habilita el service worker real y desactiva las interceptaciones antes de cortar la conexión; verifica una operación pendiente, recarga y reenvío sin duplicados.

`playwright.config.ts` utiliza exclusivamente `.env.e2e.local` para el servidor de QA; sin ese archivo deja las conexiones vacías. No hereda `.env.local` para escribir en desarrollo o producción. Los escenarios simulados no necesitan credenciales.

## Cobertura automatizada

| Área              | Comprobaciones                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Dinero            | Centavos exactos, coma/punto, entradas inválidas, CAD/USD, ausencia de tasa, tasas históricas, exclusión de eliminados          |
| Validación        | Payload por módulo, gastos mayores a cero, fechas y horas reales, cédulas para todo el viaje                                    |
| CSV               | Montos originales/convertidos, comillas escapadas, neutralización de fórmulas                                                   |
| Persistencia      | Registro y cola atómicos, fusión de ediciones pendientes, conservación ante descarga remota                                     |
| Reintentos        | Confirmar únicamente la operación enviada, conservar edición durante envío, enviar un cambio agregado durante la descarga       |
| Respaldos         | Recuperar registros/bytes, encolar, no duplicar ni sobrescribir existentes, rechazar archivos incompletos antes de escribir     |
| Navegación        | Contexto real, ruta, documentos, equipaje y compras                                                                             |
| Gastos UI         | Registrar, recargar, editar, exportar, conservar una tasa histórica nula                                                        |
| Conversor UI      | Dos direcciones y tasa manual                                                                                                   |
| Archivos UI       | Adjuntar una imagen y restaurarla desde ZIP en un segundo navegador aislado                                                     |
| Dos dispositivos  | Compartir edición, conservar conflicto, comparar versiones, resolver y propagar borrado                                         |
| Fallo de servidor | Conservar pendiente y recuperar sin duplicación                                                                                 |
| API HTTP          | Rechazar JSON inválido, registro inválido, exceso de tamaño y origen ajeno; aceptar el host legítimo antes de validar contenido |
| Presentación      | Sin desbordamiento en viewport móvil, capturas claro/oscuro y axe WCAG 2 A/AA en Resumen/Ajustes                                |
| PWA               | Precache de ruta no visitada, modo offline, recarga y reconexión en Chromium                                                    |

La accesibilidad automatizada cubre las páginas indicadas, no todos los estados posibles. Las capturas se guardan en `test-results/`; se han inspeccionado visualmente en modo claro y oscuro.

## Base de datos real, separada de UI simulada

La rama `qa-listo-para-viajar` del proyecto Neon `viaje` es el entorno de prueba. Configurar su conexión directa en `.env.e2e.local`:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@QA-POOLER-HOST/neondb?sslmode=verify-full
DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@QA-HOST/neondb?sslmode=verify-full
```

```bash
npm run test:db
```

El script llama al mismo servicio de sincronización usado por la API dentro de una transacción exterior. Comprueba creación, reintento idempotente, conflicto, actualización y borrado lógico. Fuerza rollback y verifica desde otra consulta que no quedan ni el registro ni sus confirmaciones: siete comprobaciones. No ejecutarlo con conexiones de producción.

También se ejecutó `db:check` contra desarrollo y `db:generate`: migración aplicada, seed disponible y sin diferencias de esquema. La rama de producción no se migró ni se utilizó para pruebas.

## Limitación reproducida en WebKit de macOS

La navegación tras `context.setOffline(true)` produce `WebKit encountered an internal error` en este entorno. Se reprodujo también con un service worker mínimo que solo devuelve una respuesta HTML, sin React, Next.js, IndexedDB ni código de la aplicación. La caché de la app sí contiene el HTML esperado; eso por sí solo no prueba que un iPhone pueda navegar sin señal.

Se conserva la reproducción separada:

```bash
npm run build
npm run test:e2e -- --config=playwright.diagnostic.config.ts
```

Este diagnóstico puede terminar con error y queda fuera de la batería normal. La navegación offline de la app está marcada `fixme` **solo para WebKit en macOS**, con el motivo explícito. No se marca como prueba aprobada. En Linux CI permanece habilitada para detectar su resultado en ese entorno.

Los flujos de formularios, archivos, respaldos, conflictos y fallos de API sí se comprueban en WebKit. La confirmación final de PWA instalada/offline en iOS queda pendiente de un dispositivo físico y de la URL final HTTPS.

Las pruebas con service workers no usan el mismo mecanismo de interceptación que las pruebas de interfaz; es una distinción documentada por [Playwright sobre service workers y eventos de red](https://playwright.dev/docs/network#missing-network-events-and-service-workers).

## Incidencias corregidas durante QA

- Guardado de Blob rechazado en WebKit: persistencia como bytes y lectura compatible con registros anteriores.
- Labels de selects ambiguos: asociación explícita y conservación de nombres accesibles específicos.
- Contraste insuficiente de botón en tema oscuro: ajuste del rojo.
- Gasto editado mientras se confirma su versión: conservar edición y actualizar base únicamente si el contenido previo no cambió.
- Guardado durante una descarga en curso: otra pasada de sincronización al terminar, sin esperar al intervalo.
- Gasto histórico sin tasa: editar el concepto ya no le asigna la tasa actual implícitamente.
- Origen legítimo rechazado cuando Next usa una URL interna: comparar contra el host público, conservando el rechazo de orígenes ajenos.
- Cédula asociada erróneamente a ida por búsqueda parcial de palabras: comparación exacta y corrección acotada del seed de desarrollo/QA.
- Dependencia transitiva con avisos conocidos: override de esbuild, reinstalación y verificación de Drizzle, tests y build.

## Checklist físico antes del viaje

Pendiente de ejecutar; no marcar completo solo por haber corrido Playwright.

- [ ] Publicar en Vercel por parte de Axel y configurar la rama Neon destinada al viaje.
- [ ] Abrir la URL final por HTTPS en Android Chrome y Safari iPhone.
- [ ] Esperar sincronización y descarga inicial; instalar desde cada navegador.
- [ ] Cerrar y reabrir desde el icono instalado, comprobar nombre, iconos y safe areas.
- [ ] Activar modo avión; abrir Gastos y Documentos, crear un gasto y recargar.
- [ ] Cerrar/reabrir la PWA todavía sin señal y comprobar el gasto.
- [ ] Reconectar y verificar el mismo gasto en el otro teléfono, sin duplicados.
- [ ] Tomar una foto con la cámara, abrirla, descargarla y comprobar legibilidad de un recibo real.
- [ ] Exportar ZIP y restaurarlo en otro dispositivo; comprobar imagen y PDF reales.
- [ ] Generar CSV y guardar reporte PDF con el diálogo de impresión del teléfono.
- [ ] Probar letra ampliada, teclado, lector de pantalla y manejo cómodo para Abuelita.
- [ ] Probar aviso de versión nueva sin perder anotaciones o adjuntos.
- [ ] Activar notificaciones desde un gesto, probar el aviso en app y con la PWA en segundo plano.
- [ ] Comparar los seis temporizadores y horas recomendadas contra alarmas del teléfono.
- [ ] Completar duración real del traslado en Manta y Toronto, hospedaje y documentación verificada.

Si una de las pruebas offline en los teléfonos elegidos falla, corregirla antes de depender de la PWA durante el viaje. La app nunca debe ser la única copia de boletos o documentos.

## CI y mantenimiento

`.github/workflows/qa.yml` configura Node 22, instalación limpia, `qa` y Playwright Chromium/WebKit en Ubuntu. En caso de fallo conserva reportes durante siete días. El workflow no despliega ni migra bases. **Su ejecución en GitHub todavía debe comprobarse después de publicar el código.**

Agregar prueba de regresión para cada fallo corregido. Revisar migraciones y contratos de sincronización antes de cambiar datos; nunca borrar IndexedDB para resolver una actualización. Repetir la prueba física cuando cambie el service worker o la estrategia de almacenamiento.
