import test from 'node:test';
import assert from 'node:assert/strict';
import {format as prettier} from '../src/format';
import type {ProjectFiles,FormatRequest} from '../src/api';
const files=(data:Record<string,string>={}):ProjectFiles=>({root:'/proj',read:async p=>data[p]??null,exists:async p=>p in data,list:async()=>Object.keys(data),uri:p=>'file:///proj/'+p});
const request=(text:string,language='javascript',path='a.js'):FormatRequest=>({text,path,language,options:{tabSize:2,insertSpaces:true}});
test('Prettier JS, TSX, Vue, CSS and Markdown use the real standalone parsers',async()=>{
 for(const [language,path,text,expected]of [
  ['javascript','a.js','const x={a:1}',/const x = \{ a: 1 \};/],
  ['typescript','a.tsx','const C=()=> <div a="b"/>',/const C = \(\) => <div a="b" \/>;/],
  ['vue','a.vue','<template><div>{{x}}</div></template>',/\{\{ x \}\}/],
  ['css','a.css','a{color:red}',/color: red;/],
  ['markdown','a.md','#   Title',/# Title/],
 ] as const){const result=await prettier(request(text,language,path),files());assert.match(result!.text,expected);assert.equal((await prettier(request(result!.text,language,path),files()))!.text,result!.text);}
});
test('Prettier data configuration, overrides, ignore and actionable unsupported config errors',async()=>{
 const source=files({'.prettierrc':'{"semi":false,"singleQuote":true,"overrides":[{"files":"*.js","options":{"tabWidth":4}}]}'});
 const result=await prettier(request('const x="ok";'),source);assert.equal(result!.text,"const x = 'ok'\n");
 await assert.rejects(()=>prettier(request('const x=1'),files({'.prettierignore':'*.js\n'})),/excluído/);
 await assert.rejects(()=>prettier(request('const x=1'),files({'prettier.config.js':'throw Error()'})),/executável/);
 await assert.rejects(()=>prettier(request('const x=1'),files({'.prettierrc':'plugins: [other]'})),/adicionais/);
 await assert.rejects(()=>prettier(request('const x='),files()));
});
