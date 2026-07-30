/**
 * Architecture Fitness Check Script
 * Verifies DDD Layering & Dependency Guardrails in Bella EOS.
 */

const fs = require('fs');
const path = require('path');

const DOMAIN_DIR = path.join(__dirname, '../src/core/brain');
const CONTRACTS_DIR = path.join(__dirname, '../src/core/contracts');

const FORBIDDEN_IMPORTS = [
  'next/',
  'react',
  'openai',
  '@google/generative-ai',
  '@anthropic-ai/sdk',
  '@supabase/supabase-js'
];

function checkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return true;

  const files = fs.readdirSync(dirPath);
  let passed = true;

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!checkDirectory(fullPath)) passed = false;
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const forbidden of FORBIDDEN_IMPORTS) {
        const importRegex = new RegExp(`import\\s+.*?from\\s+['"]${forbidden}.*?['"]`, 'g');
        if (importRegex.test(content)) {
          console.error(`❌ [Fitness Violation] ${fullPath} imports forbidden infrastructure library: "${forbidden}"`);
          passed = false;
        }
      }
    }
  }
  return passed;
}

console.log('🛡️ Running Architecture Fitness Tests (DDD Dependency Guardrails)...');
const domainOk = checkDirectory(DOMAIN_DIR);
const contractsOk = checkDirectory(CONTRACTS_DIR);

if (domainOk && contractsOk) {
  console.log('✅ Architecture Fitness Check PASSED! Pure Domain Layer boundaries respected.');
  process.exit(0);
} else {
  console.error('❌ Architecture Fitness Check FAILED! Boundary violations detected.');
  process.exit(1);
}
