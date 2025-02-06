import type { PathWatcherEvent, WebContainer } from '@webcontainer/api';
import { getEncoding } from 'istextorbinary';
import { map, type MapStore } from 'nanostores';
import { Buffer } from 'node:buffer';
import * as nodePath from 'node:path';
import { bufferWatchEvents } from '~/utils/buffer';
import { WORK_DIR } from '~/utils/constants';
import { computeFileModifications } from '~/utils/diff';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const logger = createScopedLogger('FilesStore');
const utf8TextDecoder = new TextDecoder('utf8', { fatal: true });

export interface File {
 type: 'file';
 content: string;
 isBinary: boolean;
}

export interface Folder {
 type: 'folder';
}

type Dirent = File | Folder;
export type FileMap = Record<string, Dirent | undefined>;

export class FilesStore {
 #webcontainer: Promise<WebContainer>;
 #size = 0;
 #modifiedFiles: Map<string, string> = import.meta.hot?.data.modifiedFiles ?? new Map();
 files: MapStore<FileMap> = import.meta.hot?.data.files ?? map({});

 get filesCount() {
   return this.#size;
 }

 constructor(webcontainerPromise: Promise<WebContainer>) {
   this.#webcontainer = webcontainerPromise;

   if (import.meta.hot) {
     import.meta.hot.data.files = this.files;
     import.meta.hot.data.modifiedFiles = this.#modifiedFiles;
   }

   this.#init();
 }

 getFile(filePath: string) {
   const dirent = this.files.get()[filePath];
   if (dirent?.type !== 'file') {
     return undefined;
   }
   return dirent;
 }

 getFileModifications() {
   return computeFileModifications(this.files.get(), this.#modifiedFiles);
 }

 resetFileModifications() {
   this.#modifiedFiles.clear();
 }

 async saveFile(filePath: string, content: string) {
   const webcontainer = await this.#webcontainer;

   try {
     const relativePath = nodePath.relative(webcontainer.workdir, filePath);

     if (!relativePath) {
       throw new Error(`EINVAL: invalid file path, write '${relativePath}'`);
     }

     const oldContent = this.getFile(filePath)?.content;

     if (!oldContent) {
       unreachable('Expected content to be defined');
     }

     await webcontainer.fs.writeFile(relativePath, content);

     if (!this.#modifiedFiles.has(filePath)) {
       this.#modifiedFiles.set(filePath, oldContent);
     }

     this.files.setKey(filePath, { type: 'file', content, isBinary: false });
     logger.info('File updated');
   } catch (error) {
     logger.error('Failed to update file content\n\n', error);
     throw error;
   }
 }

 async #init() {
   const webcontainer = await this.#webcontainer;
   webcontainer.internal.watchPaths(
     { include: [`${WORK_DIR}/**`], exclude: ['**/node_modules', '.git'], includeContent: true },
     bufferWatchEvents(100, this.#processEventBuffer.bind(this)),
   );
 }

 #processEventBuffer(events: Array<[events: PathWatcherEvent[]]>) {
   const watchEvents = events.flat(2);

   for (const { type, path, buffer } of watchEvents) {
     const sanitizedPath = path.replace(/\/+$/g, '');

     switch (type) {
       case 'add_dir': {
         this.files.setKey(sanitizedPath, { type: 'folder' });
         break;
       }
       case 'remove_dir': {
         this.files.setKey(sanitizedPath, undefined);
         for (const [direntPath] of Object.entries(this.files)) {
           if (direntPath.startsWith(sanitizedPath)) {
             this.files.setKey(direntPath, undefined);
           }
         }
         break;
       }
       case 'add_file':
       case 'change': {
         if (type === 'add_file') {
           this.#size++;
         }

         let content = '';
         const isBinary = isBinaryFile(buffer);

         if (!isBinary) {
           content = this.#decodeFileContent(buffer);
         }

         this.files.setKey(sanitizedPath, { type: 'file', content, isBinary });
         break;
       }
       case 'remove_file': {
         this.#size--;
         this.files.setKey(sanitizedPath, undefined);
         break;
       }
       case 'update_directory': {
         break;
       }
     }
   }
 }

 #decodeFileContent(buffer?: Uint8Array) {
   if (!buffer || buffer.byteLength === 0) {
     return '';
   }
   try {
     return utf8TextDecoder.decode(buffer);
   } catch (error) {
     console.log(error);
     return '';
   }
 }

 async exportToZip() {
   const zip = new JSZip();
   const files = this.files.get();

   for (const [path, dirent] of Object.entries(files)) {
     if (dirent?.type === 'file' && !dirent.isBinary) {
       zip.file(path, dirent.content);
     }
   }

   const blob = await zip.generateAsync({ type: 'blob' });
   saveAs(blob, 'project.zip');
 }
}

function isBinaryFile(buffer: Uint8Array | undefined) {
 if (buffer === undefined) {
   return false;
 }
 return getEncoding(convertToBuffer(buffer), { chunkLength: 100 }) === 'binary';
}

function convertToBuffer(view: Uint8Array): Buffer {
 const buffer = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
 Object.setPrototypeOf(buffer, Buffer.prototype);
 return buffer as Buffer;
}