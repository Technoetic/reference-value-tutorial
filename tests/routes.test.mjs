import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRoute,routeUrl,ROUTES} from '../src/shared/routes.js';
test('six shareable URLs keep GitHub Pages project prefix',()=>{
 assert.equal(ROUTES.length,6);
 for(const r of ROUTES){const u=routeUrl(r.path,'https://demo.test/reference-value-tutorial/');assert.equal(u.pathname,'/reference-value-tutorial/');assert.equal(parseRoute(u.hash).path,r.path);}
});
test('malicious and unknown hash routes do not become external navigation',()=>{
 for(const path of ['//evil.test','https://evil.test','/\\evil.test'])assert.equal(parseRoute(path).path,'/missing');
 assert.equal(parseRoute('#/unknown').path,'/unknown');
});
