declare module "tiged" {
  interface TigedOptions {
    disableCache?: boolean;
    force?: boolean;
    verbose?: boolean;
  }

  interface Emitter {
    clone(dest: string): Promise<void>;
  }

  function tiged(repo: string, options?: TigedOptions): Emitter;
  export default tiged;
}
