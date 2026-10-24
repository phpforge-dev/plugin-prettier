import {format} from './format';
declare const ide:{register(plugin:unknown):void};
ide.register({format});
