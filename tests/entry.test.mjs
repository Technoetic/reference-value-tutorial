import test from 'node:test';
import assert from 'node:assert/strict';
import {EntryService} from '../src/services/entry-service.js';
test('stale entry switches full document before mounting editable UI, preserving intended route',async()=>{
 let url;const version={pendingBuild:'rv-new',refresh:async()=>{}};const gate=new EntryService({version,currentURL:'https://demo.test/tutorial/#/equality',replace:value=>url=value});
 assert.equal(await gate.start(),'replaced');const target=new URL(url);assert.equal(target.hash,'#/equality');assert.ok(target.searchParams.get('_rv').startsWith('rv-new-'));
});
test('same-build or failed version check still starts the existing app',async()=>{
 for(const version of [{pendingBuild:null,refresh:async()=>{}},{pendingBuild:null,refresh:async()=>{throw Error('offline');}}]){let replaced=false;const gate=new EntryService({version,currentURL:'https://demo.test/',replace:()=>replaced=true});assert.equal(await gate.start(),'continue');assert.equal(replaced,false);}
});
test('persistent CDN version/HTML mismatch does not create an automatic reload loop',async()=>{
 let replaced=false;const gate=new EntryService({version:{pendingBuild:'rv-new',refresh:async()=>{}},currentURL:'https://demo.test/tutorial/?_rv=rv-new-previous-attempt#/value',replace:()=>replaced=true});
 assert.equal(await gate.start(),'continue');assert.equal(replaced,false);
});
