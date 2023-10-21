export const logger = {
  notice(...args: any[]) {
    console.log(...args);
  },
  warn(...args: any[]) {
    console.warn(...args);
  },
  error(...args: any[]) {
    console.error(...args);
  },
  panic(...args: any[]) {
    console.error(...args);
    return `${args}`;
  }
};