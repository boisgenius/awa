#!/usr/bin/env node

/**
 * TDD Auto-Fix Script
 *
 * Runs tests in watch mode with automatic fix attempts.
 * When tests fail, this script can be used with Claude Code
 * to automatically analyze and fix issues.
 *
 * Usage:
 *   pnpm test:fix
 *   node scripts/auto-fix.js [test-pattern]
 */

const { spawn } = require('child_process');
const path = require('path');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function runTests(pattern) {
  return new Promise((resolve) => {
    const args = ['vitest', 'run'];
    if (pattern) {
      args.push(pattern);
    }
    args.push('--reporter=verbose');

    const child = spawn('npx', args, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  const pattern = process.argv[2];

  console.log('\\n🧪 TDD Auto-Fix Script');
  console.log('━'.repeat(50));

  if (pattern) {
    console.log(`Running tests matching: ${pattern}`);
  } else {
    console.log('Running all tests...');
  }
  console.log('');

  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    attempt++;
    console.log(`\\n📋 Attempt ${attempt}/${MAX_RETRIES}`);
    console.log('─'.repeat(30));

    success = await runTests(pattern);

    if (success) {
      console.log('\\n✅ All tests passed!');
    } else if (attempt < MAX_RETRIES) {
      console.log(`\\n❌ Tests failed. Waiting ${RETRY_DELAY}ms before retry...`);
      console.log('💡 Tip: Use Claude Code to analyze and fix the failing tests.');
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
    }
  }

  if (!success) {
    console.log('\\n❌ Tests still failing after maximum retries.');
    console.log('\\n📝 Next steps:');
    console.log('   1. Review the test output above');
    console.log('   2. Ask Claude Code to analyze and fix the issues');
    console.log('   3. Run pnpm test:watch to monitor changes');
    process.exit(1);
  }

  process.exit(0);
}

main().catch(console.error);
