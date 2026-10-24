import {rolldown} from 'rolldown';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
const dir='.';
const bundle=await rolldown({input:dir+'/src/index.ts',platform:'browser'});
await bundle.write({file:dir+'/main.js',format:'iife',minify:true});await bundle.close();
await mkdir(dir+'/licenses',{recursive:true});
for(const pkg of ['prettier','yaml','ignore']){const name=pkg==='ignore'?'LICENSE-MIT':'LICENSE';await cp('node_modules/'+pkg+'/'+name,dir+'/licenses/'+pkg+'.txt');}
await cp('node_modules/prettier/THIRD-PARTY-NOTICES.md',dir+'/licenses/prettier-third-party-notices.md');

const manifest=JSON.parse(await readFile(dir+'/plugin.json','utf8'));
await writeFile(dir+'/versions.json',JSON.stringify(Object.fromEntries(await Promise.all(['prettier','yaml','ignore'].map(async name=>[name,JSON.parse(await readFile('node_modules/'+name+'/package.json','utf8')).version]))),null,2)+'\n');

// Normalize license line endings so Linux and macOS produce identical packages.
for (const name of ['prettier.txt','yaml.txt','ignore.txt','prettier-third-party-notices.md']) {
 const path=dir+'/licenses/'+name;
 await writeFile(path,(await readFile(path,'utf8')).replaceAll('\r\n','\n'));
}
