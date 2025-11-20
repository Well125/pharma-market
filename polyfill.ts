
// Polyfill for process.env to prevent runtime crash in browser
if (typeof window !== 'undefined' && !('process' in window)) {
  // @ts-ignore
  window.process = {
    env: {
      API_KEY: ''
    }
  };
}
