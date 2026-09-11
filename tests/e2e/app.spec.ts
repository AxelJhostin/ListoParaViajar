import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { initialRecords } from '../../src/domain/seed';
import type { TripRecord } from '../../src/domain/models';
test.beforeEach(async({context})=>{
 const records=initialRecords();const receipts=new Map<string,TripRecord>();
 await context.route('**/api/rate',r=>r.fulfill({json:{value:.72,date:'2026-09-11',fetchedAt:'2026-09-11T12:00:00Z',source:'QA',manual:false}}));
 await context.route('**/api/sync',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{records}});
  const body=route.request().postDataJSON();if(receipts.has(body.opId))return route.fulfill({json:{record:receipts.get(body.opId),conflict:false}});
  const index=records.findIndex(r=>r.id===body.record.id),current=records[index];
  if((current?.version||0)!==body.baseVersion)return route.fulfill({status:409,json:{record:current||null,conflict:true}});
  const record={...body.record,version:body.baseVersion+1};if(index>=0)records[index]=record;else records.push(record);receipts.set(body.opId,record);return route.fulfill({json:{record,conflict:false}});
 });
});
test('summary, routes and documents contain real context',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Hola, familia/})).toBeVisible();await page.getByRole('link',{name:'Más',exact:true}).click();await page.getByRole('link',{name:/Ruta y vuelos/}).click();await expect(page.getByRole('heading',{name:'Colombia → Toronto',exact:true})).toBeVisible();await page.goto('/documentos');await expect(page.getByRole('heading',{name:'Pasaporte',exact:true})).toHaveCount(3);
});
test('expense persists on reload, edit works and report exports',async({page})=>{
 await page.goto('/gastos');await page.getByRole('button',{name:'Registrar gasto',exact:true}).click();await page.getByLabel('Monto del gasto',{exact:true}).fill('12.50');await page.getByLabel('Concepto / lugar').fill('Café de prueba');await page.getByRole('button',{name:'Guardar gasto',exact:true}).click();await expect(page.getByText('Fotos y comprobantes',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Listo, volver a gastos'}).click();await page.reload();await expect(page.getByText('Café de prueba',{exact:true})).toBeVisible();await page.getByRole('button',{name:/Café de prueba.*Comida/}).click();await page.getByLabel('Monto del gasto',{exact:true}).fill('14.50');await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await page.getByRole('button',{name:'Listo, volver a gastos'}).click();await expect(page.getByText('14,50 CAD',{exact:true}).first()).toBeVisible();const download=page.waitForEvent('download');await page.getByRole('button',{name:/Descargar CSV/}).click();expect((await download).suggestedFilename()).toContain('.csv');
});
test('converter works in both directions and manual rate',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Abrir conversor CAD a USD'}).click();await expect(page.getByText('72,00 USD',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Invertir monedas'}).click();await page.getByLabel('Monto USD').fill('72');await expect(page.getByText('100,00 CAD',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Tasa manual',exact:true}).click();await page.getByLabel('USD por 1 CAD',{exact:true}).fill('0.75');await page.getByRole('button',{name:'Guardar tasa'}).click();await expect(page.getByText('96,00 CAD',{exact:true})).toBeVisible();
});
test('packing ida/regreso and purchase recipients persist',async({page})=>{
 await page.goto('/equipaje');await page.getByRole('button',{name:'Agregar elemento',exact:true}).click();await page.getByLabel('Elemento',{exact:true}).fill('Cargador');await page.getByLabel('Trayecto',{exact:true}).selectOption('Regreso');await page.getByRole('button',{name:'Guardar',exact:true}).click();await page.getByRole('button',{name:'Listo',exact:true}).click();await page.getByRole('button',{name:'Pendiente',exact:true}).click();await expect(page.getByRole('button',{name:'Empacado',exact:true})).toBeVisible();await page.goto('/compras');await page.getByRole('button',{name:'Agregar compra'}).click();await page.getByLabel('Producto',{exact:true}).fill('Hoja de arce');await page.getByLabel('Destinatario').fill('Mamá');await page.getByLabel('Precio estimado (CAD)',{exact:true}).fill('8');await page.getByRole('button',{name:'Guardar',exact:true}).click();await page.getByRole('button',{name:'Listo',exact:true}).click();await expect(page.getByRole('heading',{name:'Hoja de arce'})).toBeVisible();
});
test('local attachment is retained and included in ZIP backup',async({page})=>{
 await page.goto('/documentos');await page.getByRole('button',{name:'Editar Pasaporte',exact:true}).first().click();await page.locator('input[type=file][multiple]').setInputFiles({name:'recibo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});await expect(page.getByRole('img',{name:'recibo.png'})).toBeVisible();await page.getByRole('button',{name:'Listo',exact:true}).click();await page.goto('/ajustes');const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar respaldo con adjuntos'}).click();expect((await download).suggestedFilename()).toMatch(/\.zip$/);
});
test('mobile layout and accessibility in light/dark themes',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Hola, familia/})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);let results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();expect(results.violations).toEqual([]);await page.goto('/ajustes');await page.getByRole('button',{name:'Oscuro',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();expect(results.violations).toEqual([]);
});
test('precache opens unvisited routes offline and retains new expense',async({page,context})=>{
 await page.goto('/');await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.goto('/gastos');await page.getByRole('button',{name:'Registrar gasto',exact:true}).click();await page.getByLabel('Monto del gasto',{exact:true}).fill('9.75');await page.getByLabel('Concepto / lugar').fill('Compra sin señal');await page.getByRole('button',{name:'Guardar gasto',exact:true}).click();await page.getByRole('button',{name:'Listo, volver a gastos'}).click();await page.reload();await expect(page.getByText('Compra sin señal',{exact:true})).toBeVisible();await page.goto('/documentos');await expect(page.getByRole('heading',{name:'Documentos esenciales',exact:true})).toBeVisible();await context.setOffline(false);await page.goto('/gastos');await expect(page.getByText('Compra sin señal',{exact:true})).toBeVisible();
});
