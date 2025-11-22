#!/usr/bin/env node

/**
 * Set Edge Function Secrets
 * This script sets secrets for Supabase edge functions via the Management API
 */

import { createManagementClient } from '../lib/supabaseManagement';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

// Interface for readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Prompt for secret value with masking option
 */
async function promptSecret(name: string, required: boolean = true): Promise<string | null> {
  const envValue = process.env[name];
  
  if (envValue) {
    console.log(`✓ ${name}: Using value from environment variable`);
    return envValue;
  }
  
  const value = await prompt(`Enter value for ${name}${required ? '' : ' (optional)'}: `);
  
  if (!value && required) {
    throw new Error(`${name} is required`);
  }
  
  return value || null;
}

/**
 * Set secrets for edge functions
 */
async function setSecrets() {
  try {
    console.log('Setting Edge Function Secrets\n');
    console.log('This script will set the following secrets:');
    console.log('  - BASE44_API_KEY (required for Base44 integration)');
    console.log('  - BASE44_AGENT_API_URL (Base44 agent endpoint URL)');
    console.log('  - OPENAI_API_KEY (required for AI agents)');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY (for database access)');
    console.log('  - SUPABASE_DB_URL (database connection)');
    console.log('  - Additional custom secrets (optional)\n');
    
    // Create management client
    const client = createManagementClient();
    
    // Collect secrets
    const secrets: Record<string, string> = {};
    
    // Required secrets
    console.log('Required Secrets:\n');
    
    // BASE44 API Key
    const base44Key = await promptSecret('BASE44_API_KEY');
    if (base44Key) secrets.BASE44_API_KEY = base44Key;
    
    // BASE44 Agent API URL
    const base44Url = await promptSecret('BASE44_AGENT_API_URL');
    if (base44Url) secrets.BASE44_AGENT_API_URL = base44Url;
    
    // OpenAI API Key
    const openaiKey = await promptSecret('OPENAI_API_KEY');
    if (openaiKey) secrets.OPENAI_API_KEY = openaiKey;
    
    // Supabase Service Role Key
    const serviceRoleKey = await promptSecret('SUPABASE_SERVICE_ROLE_KEY');
    if (serviceRoleKey) secrets.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;
    
    // Database URL
    const dbUrl = await promptSecret('SUPABASE_DB_URL');
    if (dbUrl) secrets.SUPABASE_DB_URL = dbUrl;
    
    // Optional secrets
    console.log('\nOptional Secrets:\n');
    
    // Slack webhook (optional)
    const slackWebhook = await promptSecret('SLACK_WEBHOOK_URL', false);
    if (slackWebhook) secrets.SLACK_WEBHOOK_URL = slackWebhook;
    
    // SendGrid API key (optional)
    const sendgridKey = await promptSecret('SENDGRID_API_KEY', false);
    if (sendgridKey) secrets.SENDGRID_API_KEY = sendgridKey;
    
    // Custom secrets
    console.log('\nAdditional Custom Secrets:');
    console.log('Enter custom secrets in KEY=VALUE format. Press Enter with empty input to finish.\n');
    
    while (true) {
      const customSecret = await prompt('Custom secret (KEY=VALUE or empty to continue): ');
      
      if (!customSecret) break;
      
      const [key, ...valueParts] = customSecret.split('=');
      const value = valueParts.join('=');
      
      if (!key || !value) {
        console.log('Invalid format. Use KEY=VALUE');
        continue;
      }
      
      secrets[key.trim()] = value.trim();
      console.log(`✓ Added ${key.trim()}`);
    }
    
    // Confirm before setting
    console.log('\nSecrets to be set:');
    Object.keys(secrets).forEach(key => {
      const masked = key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')
        ? '***hidden***'
        : secrets[key].substring(0, 10) + '...';
      console.log(`  - ${key}: ${masked}`);
    });
    
    const confirm = await prompt('\nConfirm setting these secrets? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('Cancelled. No secrets were set.');
      process.exit(0);
    }
    
    // Set the secrets
    console.log('\nSetting secrets...');
    await client.setSecrets(secrets);
    
    console.log('\n✅ Secrets set successfully!');
    console.log(`Total secrets set: ${Object.keys(secrets).length}`);
    
    // List current secrets
    console.log('\nCurrent secrets in project:');
    const currentSecrets = await client.listSecrets();
    currentSecrets.forEach(secret => {
      console.log(`  - ${secret.name} (created: ${secret.created_at})`);
    });
    
    console.log('\n🔐 Edge functions can now access these secrets using Deno.env.get()');
    console.log('Example: const apiKey = Deno.env.get("OPENAI_API_KEY");');
    
  } catch (error) {
    console.error('\n❌ Failed to set secrets:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Bulk update secrets from environment variables
 */
async function bulkUpdateFromEnv() {
  try {
    console.log('Bulk updating secrets from environment variables...\n');
    
    const client = createManagementClient();
    const secrets: Record<string, string> = {};
    
    // Define which environment variables to sync
    const secretKeys = [
      'BASE44_API_KEY',
      'BASE44_AGENT_API_URL',
      'OPENAI_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_DB_URL',
      'SLACK_WEBHOOK_URL',
      'SENDGRID_API_KEY'
    ];
    
    // Collect available secrets from environment
    secretKeys.forEach(key => {
      const value = process.env[key];
      if (value) {
        secrets[key] = value;
        console.log(`✓ Found ${key}`);
      } else {
        console.log(`○ Skipping ${key} (not set)`);
      }
    });
    
    if (Object.keys(secrets).length === 0) {
      console.log('\nNo secrets found in environment variables.');
      console.log('Set them in your .env file first.');
      process.exit(0);
    }
    
    // Set the secrets
    console.log(`\nSetting ${Object.keys(secrets).length} secret(s)...`);
    await client.setSecrets(secrets);
    
    console.log('\n✅ Secrets updated successfully!');
    
  } catch (error) {
    console.error('\n❌ Failed to update secrets:', error);
    process.exit(1);
  }
}

/**
 * List all current secrets
 */
async function listSecrets() {
  try {
    const client = createManagementClient();
    
    console.log('Fetching current secrets...\n');
    const secrets = await client.listSecrets();
    
    if (secrets.length === 0) {
      console.log('No secrets are currently set.');
    } else {
      console.log(`Found ${secrets.length} secret(s):\n`);
      secrets.forEach((secret, index) => {
        console.log(`${index + 1}. ${secret.name}`);
        console.log(`   Created: ${secret.created_at}`);
        console.log(`   Updated: ${secret.updated_at}\n`);
      });
    }
    
  } catch (error) {
    console.error('Failed to list secrets:', error);
    process.exit(1);
  }
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
  console.log('=====================================');
  console.log('Supabase Edge Function Secrets Manager');
  console.log('=====================================\n');
  
  validateEnvironment();
  
  // Check for command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'bulk':
      bulkUpdateFromEnv();
      break;
    case 'list':
      listSecrets();
      break;
    case 'set':
    default:
      setSecrets();
      break;
  }
}

export { setSecrets, bulkUpdateFromEnv, listSecrets };