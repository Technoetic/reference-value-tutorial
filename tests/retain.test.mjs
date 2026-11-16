import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile} from 'node:fs/promises';
import path from 'node:path';
import {APP} from '../scripts/build.mjs';
import {retainAssets} from '../scripts/retain-assets.mjs';
test('retain older immutable graphs too while cached entry HTML may still reference them',async()=>{
 const entries={'assets/main.rv-old.js':'export const value=1;','assets/main.rv-new.js':'export const value=2;'};
 const hash=t=>createHash('sha256').update(t).digest('hex');
 const manifest={schema:1,buildId:'rv-new',sourceCommit:'a'.repeat(40),files:Object.fromEntries(Object.entries(entries).map(([k,v])=>[k,hash(v)]))};
 const dir=await mkdtemp(path.join(APP,'.qa-retain-'));
 const fetcher=async url=>{const name=new URL(url).pathname.split('/').slice(2).join('/');return new Response(name==='pages-manifest.json'?JSON.stringify(manifest):name==='version.json'?JSON.stringify({buildId:'rv-new'}):entries[name],{status:200});};
 const result=await retainAssets({baseUrl:'https://demo.test/tutorial/',outDir:dir,fetcher});assert.equal(result.retained,2);assert.equal(await readFile(path.join(dir,'assets/main.rv-old.js'),'utf8'),entries['assets/main.rv-old.js']);
});
