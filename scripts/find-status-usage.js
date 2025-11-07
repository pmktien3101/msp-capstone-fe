#!/usr/bin/env node

/**
 * Script to find all files that need status enum migration
 * Run: node scripts/find-status-usage.js
 */

const fs = require('fs');
const path = require('path');

const SEARCH_PATTERNS = [
  // Task statuses (Vietnamese)
  'Chưa bắt đầu',
  'Đang làm',
  'Đang thực hiện',
  'Tạm dừng',
  'Quá hạn',
  'Hoàn thành',
  
  // Project statuses (Vietnamese)
  'Lập kế hoạch',
  'Đang hoạt động',
];

const IGNORE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'docs', // Ignore docs folder
];

const SEARCH_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function searchInFile(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];
    
    lines.forEach((line, index) => {
      if (line.includes(pattern)) {
        matches.push({
          line: index + 1,
          content: line.trim()
        });
      }
    });
    
    return matches;
  } catch (err) {
    return [];
  }
}

function searchDirectory(dir, results = {}) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        searchDirectory(filePath, results);
      }
    } else {
      const ext = path.extname(file);
      if (SEARCH_EXTENSIONS.includes(ext)) {
        SEARCH_PATTERNS.forEach(pattern => {
          const matches = searchInFile(filePath, pattern);
          if (matches.length > 0) {
            if (!results[filePath]) {
              results[filePath] = {};
            }
            results[filePath][pattern] = matches;
          }
        });
      }
    }
  });
  
  return results;
}

// Run search
console.log('🔍 Searching for hardcoded status strings...\n');
const results = searchDirectory(process.cwd());

// Print results
const fileCount = Object.keys(results).length;
console.log(`📊 Found ${fileCount} files with hardcoded status strings:\n`);

Object.entries(results).forEach(([file, patterns]) => {
  const relativePath = path.relative(process.cwd(), file);
  console.log(`\n📄 ${relativePath}`);
  
  Object.entries(patterns).forEach(([pattern, matches]) => {
    console.log(`  🔸 "${pattern}" (${matches.length} occurrences)`);
    matches.forEach(match => {
      console.log(`     Line ${match.line}: ${match.content.substring(0, 80)}...`);
    });
  });
});

console.log(`\n✅ Search complete! Found ${fileCount} files to update.`);
console.log('\n💡 Next steps:');
console.log('1. Review docs/STATUS_ENUM_MIGRATION.md');
console.log('2. Update each file to use status enums');
console.log('3. Test thoroughly before deploying');
