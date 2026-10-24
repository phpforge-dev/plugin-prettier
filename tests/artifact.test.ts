import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('published bundle is accepted by the IDE source transport',async()=>{
 const code=await readFile(new URL('../main.js',import.meta.url));
 assert.equal(code.includes(0),false,'literal NUL would be rejected by pluginSource');
 assert.ok(code.length<8*1024*1024);
});
