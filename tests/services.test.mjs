import test from 'node:test';
import assert from 'node:assert/strict';
import {VersionService} from '../src/services/version-service.js';
import {LabStorageService,emptyProgress} from '../src/services/storage-service.js';
import {ContentService} from '../src/services/content-service.js';

const baseUrl='https://example.test/reference-value-tutorial/';
test('loaded HTML identity detects update and rollback',async()=>{
 const v=new VersionService({baseUrl,loadedBuild:'rv-b',fetcher:async()=>({ok:true,json:async()=>({buildId:'rv-a'})})});
 assert.equal((await v.navigation('#/value',()=>({dirty:false,saving:false}))).kind,'reload');
 assert.equal(v.loadedBuild,'rv-b');
});
test('dirty input started during version check protects navigation',async()=>{
 let release;let dirty=false;
 const v=new VersionService({baseUrl,loadedBuild:'rv-a',fetcher:()=>new Promise(r=>release=r)});
 const move=v.navigation('#/code',()=>({dirty,saving:false}));dirty=true;
 release({ok:true,json:async()=>({buildId:'rv-b'})});assert.equal((await move).kind,'protect');
});
test('save in flight blocks even without dirty input',async()=>{
 const v=new VersionService({baseUrl,loadedBuild:'rv-a',fetcher:async()=>({ok:true,json:async()=>({buildId:'rv-b'})})});
 assert.equal((await v.navigation('#/',()=>({dirty:false,saving:true}))).kind,'protect');
});
test('version failure or invalid response keeps current runtime usable',async()=>{
 for(const fetcher of [async()=>{throw Error('offline');},async()=>({ok:false}),async()=>({ok:true,json:async()=>({buildId:'<bad>'})})]){
  const v=new VersionService({baseUrl,loadedBuild:'rv-a',fetcher});assert.equal((await v.navigation('#/',()=>({}))).kind,'spa');assert.equal(v.status,'unavailable');
 }
});
test('version timeout returns without forcing a reload',async()=>{
 const v=new VersionService({baseUrl,loadedBuild:'rv-a',timeoutMs:15,fetcher:()=>new Promise(()=>{})});assert.equal((await v.refresh()).status,'unavailable');
});
test('failed save rejects, leaves existing saved content intact',async()=>{
 const store=new LabStorageService({storage:{getItem:()=>null,setItem:()=>{throw Error('quota');}}});
 await assert.rejects(store.save(emptyProgress()),/저장/);
});
test('progress survives save/load with defensive cloning and corrupt data fallback',async()=>{
 const mem=new Map();const storage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};
 const service=new LabStorageService({storage});const p=emptyProgress();p.note='나만의 정리';p.reference.push({side:'left',amount:1000});
 await service.save(p);p.note='mutated';assert.equal(service.load().note,'나만의 정리');
 storage.setItem(service.key,'{bad');assert.deepEqual(service.load(),emptyProgress());assert.ok(service.warning);
});
test('content rejects HTTP errors and supports caller cancellation',async()=>{
 const fail=new ContentService({baseUrl,fetcher:async()=>({ok:false,status:503})});await assert.rejects(fail.load(),/503/);
 const abort=new AbortController();abort.abort();const s=new ContentService({baseUrl,fetcher:async()=>{throw Error('should not load');}});await assert.rejects(s.load(abort.signal),{name:'AbortError'});
});
test('blocked localStorage getter still permits reading and reports a save failure',async()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError');}});
 try{const s=new LabStorageService();assert.deepEqual(s.load(),emptyProgress());assert.ok(s.warning);await assert.rejects(s.save(emptyProgress()),/저장/);}finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
