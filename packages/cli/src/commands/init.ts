import {Command} from 'commander';

export const init = new Command()
    .name('init')
    .description('Install an auth package into your project.')
    .action(async () => {});
