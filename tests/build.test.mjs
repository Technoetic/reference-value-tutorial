import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {build,APP} from '../scripts/build.mjs';
import {createStaticServer,bind} from '../scripts/server.mjs';
test('hashed graph matches embedded identity and subpath server returns true 404',async()=>{
 const report=await build({outDir:'.qa-test'});const html=await readFile(path.join(report.out,'index.html'),'utf8');assert.ok(html.includes(`content="${report.buildId}"`));assert.ok(html.includes('main.'+report.buildId+'.js'));
 const main=await readFile(path.join(report.out,'assets','main.'+report.buildId+'.js'),'utf8');assert.ok(main.includes('services/router.'+report.buildId+'.js'));assert.ok(!main.includes("'./services/router.js'"));
 const server=await bind(createStaticServer({root:report.out}),0);const base='http://127.0.0.1:'+server.address().port+'/reference-value-tutorial/';
 try{for(const f of ['missing.js','assets/missing.css','data/missing.json']){const r=await fetch(base+f);assert.equal(r.status,404);assert.ok(!(r.headers.get('content-type')||'').includes('text/html'));}const page=await fetch(base);assert.equal(page.status,200);assert.equal(page.headers.get('cache-control'),'no-store');const js=await fetch(base+'assets/main.'+report.buildId+'.js');assert.ok(js.headers.get('cache-control').includes('immutable'));}finally{await new Promise(r=>server.close(r));}
});
