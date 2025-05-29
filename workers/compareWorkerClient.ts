export const createCompareWorker = () => {
    return new Worker(new URL('./compare.worker.ts', import.meta.url), {
      type: 'module',
    });
  };
  