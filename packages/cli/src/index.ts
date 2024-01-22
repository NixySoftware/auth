#!/usr/bin/env node
import {Command} from 'commander';

import packageJson from '../package.json';
import {init} from './commands/init';

const program = new Command()
    .name('nixy-auth-cli')
    .description(packageJson.description)
    .version(packageJson.version)
    .addCommand(init);

program.parse();
