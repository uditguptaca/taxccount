// .sql files are bundled as plain strings (rule in next.config.mjs), so the
// schema ships inside the serverless function instead of being read from
// disk at runtime, which is not possible on Vercel.
declare module '*.sql' {
  const sql: string;
  export default sql;
}

// webpack's require.context, used by src/db/migrations/index.ts to pick up
// every migration file without listing them by hand.
declare namespace NodeJS {
  interface Require {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ): { keys(): string[]; (id: string): unknown };
  }
}
