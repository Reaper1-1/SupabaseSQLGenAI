#!/usr/bin/env node

/**
 * Build Edge Function
 * This script prepares the edge function for deployment by creating an eszip bundle
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const FUNCTION_NAME = 'agent-router';
const FUNCTIONS_DIR = path.join(__dirname, '..', 'supabase', 'functions');
const FUNCTION_PATH = path.join(FUNCTIONS_DIR, FUNCTION_NAME);
const OUTPUT_DIR = path.join(FUNCTION_PATH, 'dist');
const ESZIP_PATH = path.join(FUNCTION_PATH, 'bundle.eszip');

/**
 * Ensure required directories exist
 */
function ensureDirectories() {
  if (!fs.existsSync(FUNCTION_PATH)) {
    console.error(`Function directory not found: ${FUNCTION_PATH}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
}

/**
 * Check if Deno is installed
 */
function checkDeno(): boolean {
  try {
    execSync('deno --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Bundle the edge function using Deno
 */
async function bundleWithDeno() {
  console.log('Bundling edge function with Deno...');
  
  const indexPath = path.join(FUNCTION_PATH, 'index.ts');
  const bundlePath = path.join(OUTPUT_DIR, 'bundle.js');
  
  try {
    // Bundle the TypeScript file
    const bundleCmd = `deno bundle ${indexPath} ${bundlePath}`;
    console.log(`Running: ${bundleCmd}`);
    execSync(bundleCmd, { stdio: 'inherit' });
    
    console.log(`✅ Bundle created at: ${bundlePath}`);
    
    // Create eszip if eszip tool is available
    try {
      const eszipCmd = `deno run -A https://deno.land/x/eszip@v0.55.2/eszip.ts ${bundlePath} ${ESZIP_PATH}`;
      console.log(`Creating eszip: ${eszipCmd}`);
      execSync(eszipCmd, { stdio: 'inherit' });
      console.log(`✅ Eszip created at: ${ESZIP_PATH}`);
    } catch (error) {
      console.log('⚠️ Could not create eszip bundle. Will use JavaScript bundle for deployment.');
    }
    
  } catch (error) {
    console.error('Failed to bundle with Deno:', error);
    throw error;
  }
}

/**
 * Bundle the edge function manually (fallback)
 */
async function bundleManually() {
  console.log('Creating deployment package manually...');
  
  const indexPath = path.join(FUNCTION_PATH, 'index.ts');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  // Create a simple bundle by copying the source
  // In production, you would use a proper bundler like esbuild or webpack
  const bundleContent = `
// Generated bundle for ${FUNCTION_NAME}
// Created: ${new Date().toISOString()}

${indexContent}
`;
  
  const bundlePath = path.join(OUTPUT_DIR, 'bundle.js');
  fs.writeFileSync(bundlePath, bundleContent);
  
  console.log(`✅ Simple bundle created at: ${bundlePath}`);
  console.log('Note: For production, use Deno bundling for optimal performance.');
}

/**
 * Validate the function source
 */
function validateFunction() {
  console.log('Validating edge function...');
  
  const indexPath = path.join(FUNCTION_PATH, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.error(`Function entry point not found: ${indexPath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(indexPath, 'utf-8');
  
  // Check for required imports
  const requiredImports = [
    'serve',
    '@supabase/supabase-js'
  ];
  
  const missingImports = requiredImports.filter(imp => !content.includes(imp));
  
  if (missingImports.length > 0) {
    console.warn('⚠️ Warning: Missing expected imports:', missingImports);
  }
  
  // Check for serve() call
  if (!content.includes('serve(')) {
    console.error('❌ Error: Function must call serve() to handle requests');
    process.exit(1);
  }
  
  console.log('✅ Function validation passed');
}

/**
 * Generate import map for the function
 */
function generateImportMap() {
  console.log('Generating import map...');
  
  const importMap = {
    imports: {
      "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2",
      "std/": "https://deno.land/std@0.168.0/"
    }
  };
  
  const importMapPath = path.join(FUNCTION_PATH, 'import_map.json');
  fs.writeFileSync(importMapPath, JSON.stringify(importMap, null, 2));
  
  console.log(`✅ Import map created at: ${importMapPath}`);
}

/**
 * Create a deployment manifest
 */
function createManifest() {
  console.log('Creating deployment manifest...');
  
  const manifest = {
    name: FUNCTION_NAME,
    version: '1.0.0',
    entrypoint: 'index.ts',
    verify_jwt: true,
    created_at: new Date().toISOString(),
    env_vars: [
      'OPENAI_API_KEY',
      'BASE44_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_DB_URL'
    ],
    cors_origins: ['*'],
    description: 'Agent router for Better Man Project - handles AI agent interactions and memory'
  };
  
  const manifestPath = path.join(FUNCTION_PATH, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Manifest created at: ${manifestPath}`);
}

/**
 * Create a local test script
 */
function createTestScript() {
  console.log('Creating test script...');
  
  const testScript = `#!/usr/bin/env node
/**
 * Test script for ${FUNCTION_NAME} edge function
 */

const axios = require('axios');
require('dotenv').config();

async function testFunction() {
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!projectRef || !anonKey) {
    console.error('Missing SUPABASE_PROJECT_REF or EXPO_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  
  const url = \`https://\${projectRef}.supabase.co/functions/v1/${FUNCTION_NAME}\`;
  
  const testPayload = {
    userId: 'test-user-123',
    agentName: 'devotional_guide',
    message: 'What does it mean to walk in faith?'
  };
  
  console.log('Testing edge function at:', url);
  console.log('Payload:', testPayload);
  
  try {
    const response = await axios.post(url, testPayload, {
      headers: {
        'Authorization': \`Bearer \${anonKey}\`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\\n✅ Success!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('\\n❌ Test failed:');
    console.error(error.response?.data || error.message);
  }
}

if (require.main === module) {
  testFunction();
}
`;
  
  const testPath = path.join(FUNCTION_PATH, 'test.js');
  fs.writeFileSync(testPath, testScript);
  fs.chmodSync(testPath, '755');
  
  console.log(`✅ Test script created at: ${testPath}`);
}

/**
 * Main build function
 */
async function buildEdgeFunction() {
  try {
    console.log('Building Edge Function: ' + FUNCTION_NAME);
    console.log('=====================================\n');
    
    // Ensure directories exist
    ensureDirectories();
    
    // Validate the function
    validateFunction();
    
    // Generate supporting files
    generateImportMap();
    createManifest();
    createTestScript();
    
    // Bundle the function
    if (checkDeno()) {
      await bundleWithDeno();
    } else {
      console.log('⚠️ Deno not found. Using fallback bundling method.');
      console.log('For optimal results, install Deno: https://deno.land/manual/getting_started/installation');
      await bundleManually();
    }
    
    console.log('\n✅ Build completed successfully!');
    console.log('\nBuild artifacts:');
    console.log(`  - Function source: ${path.join(FUNCTION_PATH, 'index.ts')}`);
    console.log(`  - Import map: ${path.join(FUNCTION_PATH, 'import_map.json')}`);
    console.log(`  - Manifest: ${path.join(FUNCTION_PATH, 'manifest.json')}`);
    console.log(`  - Test script: ${path.join(FUNCTION_PATH, 'test.js')}`);
    
    if (fs.existsSync(ESZIP_PATH)) {
      console.log(`  - Eszip bundle: ${ESZIP_PATH}`);
    } else {
      console.log(`  - JavaScript bundle: ${path.join(OUTPUT_DIR, 'bundle.js')}`);
    }
    
    console.log('\nNext steps:');
    console.log('1. Run scripts/deployAgentRouter.ts to deploy the function');
    console.log('2. Run scripts/setSecrets.ts to configure environment secrets');
    console.log('3. Test the deployment with: node ' + path.join(FUNCTION_PATH, 'test.js'));
    
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

/**
 * Clean build artifacts
 */
function clean() {
  console.log('Cleaning build artifacts...');
  
  const filesToRemove = [
    path.join(FUNCTION_PATH, 'bundle.eszip'),
    path.join(FUNCTION_PATH, 'import_map.json'),
    path.join(FUNCTION_PATH, 'manifest.json'),
    path.join(FUNCTION_PATH, 'test.js'),
    OUTPUT_DIR
  ];
  
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      if (fs.statSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true });
      } else {
        fs.unlinkSync(file);
      }
      console.log(`  Removed: ${file}`);
    }
  });
  
  console.log('✅ Clean completed');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'clean':
      clean();
      break;
    case 'build':
    default:
      buildEdgeFunction();
      break;
  }
}

export { buildEdgeFunction, clean };