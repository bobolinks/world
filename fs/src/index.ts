import { env } from './env';
import { main, } from 'sfex/src/index';
import methods from './methods';

main(env, new methods(), {
  file: env.paths.fs
});