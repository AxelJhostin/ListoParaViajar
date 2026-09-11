import { describe, expect, it } from 'vitest';
import { convert, expenseTotal, parseMoney } from '@/domain/money';
import { defaults, expenseSchema, recordSchema, type Rate, type TripRecord } from '@/domain/models';
import { buildCsv } from '@/features/reports/export';
const rate:Rate={value:.72,date:'2026-09-11',fetchedAt:'2026-09-11T12:00:00Z',source:'Test',manual:false};
describe('Money and records',()=>{
 it('parses cents without float multiplication',()=>{expect(parseMoney('12,30')).toBe(1230);expect(parseMoney('0.29')).toBe(29);});
 it.each(['-1','Infinity','1.234','1,200.00',''])('rejects invalid amount %s',v=>expect(()=>parseMoney(v)).toThrow());
 it('converts both directions with a rate',()=>{expect(convert(10000,'CAD','USD',rate)).toBe(7200);expect(convert(7200,'USD','CAD',rate)).toBe(10000);});
 it('does not fabricate a rate offline',()=>{expect(convert(10000,'CAD','USD',null)).toBeNull();expect(convert(10000,'CAD','CAD',null)).toBe(10000);});
 it('rejects zero expenses',()=>{expect(expenseSchema.safeParse({...defaults('expense'),description:'Zero'}).success).toBe(false);});
 it('validates payload according to kind',()=>{expect(recordSchema.safeParse({id:crypto.randomUUID(),kind:'expense',data:{description:'Oops'},version:0,updatedAt:'',deleted:false}).success).toBe(false);});
 it('totals only expenses and keeps original exchange rates',()=>{const row:TripRecord<'expense'>={id:crypto.randomUUID(),kind:'expense',version:1,deleted:false,updatedAt:'',data:{...defaults('expense'),description:'Test',amountMinor:10000,rate}};expect(expenseTotal([row],'USD')).toEqual({total:7200,missing:0});expect(expenseTotal([{...row,data:{...row.data,rate:null}}],'USD')).toEqual({total:0,missing:1});expect(expenseTotal([{...row,deleted:true}],'CAD').total).toBe(0);});
 it('exports quoted CSV and neutralizes spreadsheet formulas',()=>{const row:TripRecord<'expense'>={id:crypto.randomUUID(),kind:'expense',version:1,deleted:false,updatedAt:'',data:{...defaults('expense'),description:'=CMD("x")',amountMinor:1250,rate}};const csv=buildCsv([row]);expect(csv).toContain('"\'=CMD(""x"")"');expect(csv).toContain('"12.50"');expect(csv).toContain('"9.00"');});
});
