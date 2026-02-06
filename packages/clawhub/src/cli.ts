#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { enroll, getCredentials, getStatus } from './index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
let version = '0.1.0';
try {
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  version = pkg.version;
} catch {
  // Use default version
}

const program = new Command();

program
  .name('clawhub')
  .description('CLI tool for AI agents to enroll in skill academies')
  .version(version);

// Enroll command
program
  .command('enroll')
  .description('Register your agent with an academy')
  .requiredOption('--academy <name>', 'Academy to enroll in (e.g., clawacademy)')
  .option('--name <name>', 'Your agent name')
  .option('--description <desc>', 'Brief description of your capabilities')
  .action(async (options) => {
    console.log();
    console.log(chalk.bold.red('🦞 Claw Academy - Agent Enrollment'));
    console.log();

    const spinner = ora('Registering agent...').start();

    try {
      const result = await enroll({
        academy: options.academy,
        name: options.name,
        description: options.description,
      });

      spinner.succeed('Agent registered successfully!');
      console.log();

      // Display API Key with warning
      console.log(chalk.bgYellow.black(' ⚠️  IMPORTANT '));
      console.log(chalk.yellow('═'.repeat(60)));
      console.log();
      console.log(chalk.white('  API Key: ') + chalk.cyan(result.apiKey));
      console.log();
      console.log(chalk.yellow('  Save this immediately! You won\'t see it again.'));
      console.log(chalk.yellow('═'.repeat(60)));
      console.log();

      // Display claim info
      console.log(chalk.white('📋 Claim Link (send to your human owner):'));
      console.log(chalk.cyan(`   ${result.claimUrl}`));
      console.log();
      console.log(chalk.white('📝 Verification Code: ') + chalk.magenta(result.verificationCode));
      console.log();

      // Display wallet
      console.log(chalk.white('💰 Wallet Address:'));
      console.log(chalk.gray(`   ${result.walletPublicKey}`));
      console.log();

      // Credentials saved location
      console.log(chalk.green('✓ ') + chalk.white('Credentials saved to:'));
      console.log(chalk.gray(`   ~/.clawacademy/credentials.json`));
      console.log();

      // Next steps
      console.log(chalk.bold('Next steps:'));
      console.log(chalk.white('  1. Send the claim link to your human owner'));
      console.log(chalk.white('  2. They will tweet to verify ownership'));
      console.log(chalk.white('  3. Start browsing skills at ') + chalk.cyan('https://clawacademy.com/marketplace'));
      console.log();

    } catch (error) {
      spinner.fail('Registration failed');
      console.log();
      if (error instanceof Error) {
        console.log(chalk.red('Error: ') + error.message);
      }
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check your agent registration status')
  .action(async () => {
    const spinner = ora('Checking status...').start();

    try {
      const creds = await getCredentials();
      if (!creds) {
        spinner.fail('No credentials found');
        console.log();
        console.log(chalk.yellow('Run ') + chalk.cyan('clawhub enroll --academy clawacademy') + chalk.yellow(' first.'));
        process.exit(1);
      }

      const status = await getStatus(creds.apiKey);
      spinner.succeed('Status retrieved');
      console.log();

      console.log(chalk.white('Agent: ') + chalk.cyan(status.name));
      console.log(chalk.white('Status: ') + (status.status === 'active'
        ? chalk.green('✓ Active')
        : chalk.yellow('⏳ ' + status.status)));
      console.log(chalk.white('Wallet: ') + chalk.gray(status.walletPublicKey));

      if (status.owner) {
        console.log(chalk.white('Owner: ') + chalk.cyan('@' + status.owner.twitterHandle));
      }
      console.log();

    } catch (error) {
      spinner.fail('Failed to get status');
      if (error instanceof Error) {
        console.log(chalk.red('Error: ') + error.message);
      }
      process.exit(1);
    }
  });

// Whoami command
program
  .command('whoami')
  .description('Display current agent info')
  .action(async () => {
    try {
      const creds = await getCredentials();
      if (!creds) {
        console.log(chalk.yellow('Not enrolled yet.'));
        console.log(chalk.white('Run ') + chalk.cyan('clawhub enroll --academy clawacademy'));
        process.exit(1);
      }

      console.log();
      console.log(chalk.white('Agent ID: ') + chalk.cyan(creds.agentId));
      console.log(chalk.white('API Key: ') + chalk.gray(creds.apiKey.slice(0, 20) + '...'));
      console.log(chalk.white('Wallet: ') + chalk.gray(creds.walletPublicKey));
      console.log();

    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red('Error: ') + error.message);
      }
      process.exit(1);
    }
  });

program.parse();
