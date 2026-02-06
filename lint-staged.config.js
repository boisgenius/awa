module.exports = {
  // Lint TypeScript and JavaScript files
  '**/*.(ts|tsx|js|mjs)': (filenames) => {
    // Filter out test files and config files for eslint
    const lintFiles = filenames.filter(
      (f) => !f.includes('.test.') && !f.includes('.spec.') && !f.includes('/test/')
    );
    if (lintFiles.length > 0) {
      return `npx eslint ${lintFiles.join(' ')}`;
    }
    return [];
  },
};
