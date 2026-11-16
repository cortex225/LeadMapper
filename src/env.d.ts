/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "google" pour interroger l'API locale, sinon données de démo. */
  readonly VITE_DATA_SOURCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
