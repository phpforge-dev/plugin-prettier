// Public PHP IDE formatting contract, snapshotted for independent builds.
export interface ProjectFiles {
 readonly root: string;
 read(path: string): Promise<string | null>;
 list(dir: string, accept: (name: string) => boolean): Promise<string[]>;
 exists(path: string): Promise<boolean>;
 uri(path: string): string;
}
/** UTF-16 offsets; range is optional (whole file). The result always describes the whole buffer. */
export type FormatRequest = { path: string; text: string; language: string; range?: {start: number; end: number}; options: {tabSize: number; insertSpaces: boolean} };
export type FormatResult = { text: string };
