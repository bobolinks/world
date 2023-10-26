interface LogConsole {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/debug) */
  debug(...data: any[]): void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/info) */
  info(...data: any[]): void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/error) */
  error(...data: any[]): void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/warn) */
  warn(...data: any[]): void;
}

let logConsole: LogConsole = console;

export function setConsole(cons: LogConsole) {
  logConsole = cons;
}

export const logger = {
  debug(...args: any[]) {
    logConsole.debug(...args);
  },
  notice(...args: any[]) {
    logConsole.info(...args);
  },
  warn(...args: any[]) {
    logConsole.warn(...args);
  },
  error(...args: any[]) {
    logConsole.error(...args);
  },
  panic(...args: any[]) {
    logConsole.error(...args);
    return `${args}`;
  }
};