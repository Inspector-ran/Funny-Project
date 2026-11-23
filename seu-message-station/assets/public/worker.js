import {syncNative} from './native-backend.js';
syncNative().finally(()=>window.AndroidHub.done());
