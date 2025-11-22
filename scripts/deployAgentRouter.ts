#!/usr/bin/env node

/**
 * Deploy Agent Router Edge Function
 * This script deploys the agent-router edge function to Supabase
 */

import * as fs from 'fs';
import * as path from 'path';
import { createManagementClient, SupabaseManagementClient } from '../lib/supabaseManagement';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const FUNCTION_SLUG = 'agent-router';
const FUNCTION_PATH = path.join(__dirname, '..', 'supabase', 'functions', FUNCTION_SLUG);
const ESZIP_PATH = path.join(FUNCTION_PATH, 'bundle.eszip');

/**
 * Build eszip bundle for deployment
 */
async function buildEszip(): Promise<Buffer> {
  // Check if pre-built eszip exists
  if (fs.existsSync(ESZIP_PATH)) {
    console.log('Using pre-built eszip bundle from:', ESZIP_PATH);
    return fs.readFileSync(ESZIP_PATH);
  }

  // For now, we'll create a simple deployment
  // In production, you would use Deno's eszip tool or the build script
  console.log('Note: Using simplified deployment. Run buildEdgeFunction.ts for production builds.');
  
  // Read the function source
  const indexPath = path.join(FUNCTION_PATH, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Function source not found at ${indexPath}`);
  }

  // For development, we'll return the source as-is
  // The Supabase API will handle the bundling
  return fs.readFileSync(indexPath);
}

/**
 * Deploy the agent-router edge function
 */
async function deployAgentRouter() {
  try {
    console.log('Starting deployment of agent-router edge function...\n');

    // Create management client
    const client = createManagementClient();
    
    // Check if function exists
    console.log('Checking existing functions...');
    const existingFunction = await client.getEdgeFunction(FUNCTION_SLUG);
    
    if (existingFunction) {
      console.log(`Function '${FUNCTION_SLUG}' already exists. Updating...`);
    } else {
      console.log(`Creating new function '${FUNCTION_SLUG}'...`);
    }

    // Build or load eszip bundle
    console.log('\nPreparing function bundle...');
    const eszipBuffer = await buildEszip();

    // Deploy the function
    console.log('\nDeploying function...');
    const deployment = await client.deployEdgeFunction(
      FUNCTION_SLUG,
      eszipBuffer,
      {
        entrypointPath: 'index.ts',
        verifyJWT: true  // Enable JWT verification for security
      }
    );

    console.log('\n✅ Deployment initiated successfully!');
    console.log('Deployment details:');
    console.log(`  - Function: ${FUNCTION_SLUG}`);
    console.log(`  - Deployment ID: ${deployment.id}`);
    console.log(`  - Status: ${deployment.status}`);
    console.log(`  - Created: ${deployment.created_at}`);

    // Check deployment status
    if (deployment.status === 'DEPLOYING') {
      console.log('\nWaiting for deployment to complete...');
      await waitForDeployment(client, FUNCTION_SLUG, deployment.id);
    }

    // Get the function URL
    const projectRef = process.env.SUPABASE_PROJECT_REF;
    const functionUrl = `https://${projectRef}.supabase.co/functions/v1/${FUNCTION_SLUG}`;
    
    console.log('\n🚀 Function deployed successfully!');
    console.log(`Function URL: ${functionUrl}`);
    
    // Provide next steps
    console.log('\nNext steps:');
    console.log('1. Run scripts/setSecrets.ts to configure environment secrets');
    console.log('2. Test the function with:');
    console.log(`   curl -X POST ${functionUrl} \\`);
    console.log('     -H "Authorization: Bearer YOUR_ANON_KEY" \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"message": "Hello", "agentName": "devotional_guide"}\'');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

/**
 * Wait for deployment to complete
 */
async function waitForDeployment(
  client: SupabaseManagementClient,
  functionSlug: string,
  deploymentId: string,
  maxAttempts = 30
) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const status = await client.getDeploymentStatus(functionSlug, deploymentId);
      
      if (status.status === 'DEPLOYED') {
        console.log('✅ Deployment completed successfully!');
        return;
      } else if (status.status === 'FAILED') {
        throw new Error('Deployment failed');
      }
      
      // Still deploying, wait and retry
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('\nError checking deployment status:', error);
      throw error;
    }
  }
  
  console.log('\n⚠️ Deployment is taking longer than expected. Check Supabase dashboard for status.');
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  const required = [
    'SUPABASE_MANAGEMENT_ACCESS_TOKEN',
    'SUPABASE_PROJECT_REF'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease set these in your .env file.');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  console.log('=================================');
  console.log('Agent Router Edge Function Deploy');
  console.log('=================================\n');
  
  validateEnvironment();
  deployAgentRouter();
}

export { deployAgentRouter };