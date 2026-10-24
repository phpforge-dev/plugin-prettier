import * as prettier from 'prettier/standalone';
import type {Options} from 'prettier';
import * as babel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';
import * as typescript from 'prettier/plugins/typescript';
import * as html from 'prettier/plugins/html';
import * as postcss from 'prettier/plugins/postcss';
import * as markdown from 'prettier/plugins/markdown';
import * as yaml from 'prettier/plugins/yaml';
import {parse} from 'yaml';
import ignore from 'ignore';
import {directories,matches,readStyle} from './config';
import type {FormatRequest,FormatResult,ProjectFiles} from './api';

const plugins=[babel,estree,typescript,html,postcss,markdown,yaml];
const parsers:Record<string,string>={javascript:'babel',typescript:'typescript',vue:'vue',json:'json',css:'css',scss:'scss',html:'html',markdown:'markdown',yaml:'yaml'};
/** A pinned, offline Prettier engine. Configuration is data; project JavaScript is never evaluated. */
export async function format(request:FormatRequest,files:ProjectFiles):Promise<FormatResult|null>{
 const parser=parsers[request.language];if(!parser)return null;
 const read=(path:string)=>files.read(path);
 const ignored=await read('.prettierignore');
 if(ignored&&ignore().add(ignored).ignores(request.path))throw Error('Prettier: arquivo excluído por .prettierignore');
 const style=await readStyle(request.path,read,request.options,request.text);
 let config:Record<string,unknown>={};let configDir='';
 const dirs=directories(request.path).reverse();
 outer:for(const dir of dirs){
  const base=dir?dir+'/':'';
  for(const name of ['.prettierrc','.prettierrc.json','.prettierrc.yaml','.prettierrc.yml','prettier.config.json']){
   const content=await read(base+name);if(content===null)continue;
   const parsed=name.endsWith('.json')?JSON.parse(content):parse(content);
   if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Prettier: configuração deve ser um objeto');
   config=parsed;configDir=dir;break outer;
  }
  for(const name of ['prettier.config.js','prettier.config.mjs','prettier.config.cjs','.prettierrc.js','.prettierrc.cjs','.prettierrc.mjs','prettier.config.ts','.prettierrc.ts'])if(await files.exists(base+name))throw Error('Prettier: configuração executável não suportada pelo plugin offline; use JSON ou YAML');
  const pkg=await read(base+'package.json');
  if(pkg!==null){const value=JSON.parse(pkg).prettier;if(value!==undefined){if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Prettier: configuração compartilhada externa não suportada');config=value;configDir=dir;break;}}
 }
 if(config.plugins)throw Error('Prettier: plugins adicionais do projeto não são carregados por este pacote');
 if(Array.isArray(config.overrides))for(const override of config.overrides){
  const patterns=typeof override.files==='string'?[override.files]:override.files;
  const excluded=typeof override.excludeFiles==='string'?[override.excludeFiles]:override.excludeFiles??[];
  if(Array.isArray(patterns)&&patterns.some((p:string)=>matches(p,request.path.slice(configDir?configDir.length+1:0)))&&!excluded.some((p:string)=>matches(p,request.path.slice(configDir?configDir.length+1:0))))Object.assign(config,override.options);
 }
 if(config.plugins)throw Error('Prettier: plugins adicionais não suportados');
 delete config.overrides;
 const text=await prettier.format(request.text,{tabWidth:style.tabSize,useTabs:!style.insertSpaces,endOfLine:style.eol==='\r\n'?'crlf':'lf',...config,
  filepath:request.path,parser,plugins,...(request.range?{rangeStart:request.range.start,rangeEnd:request.range.end}:{}),
 } as Options);
 return {text};
}
