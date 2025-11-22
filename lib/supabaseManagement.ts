/**
 * Supabase Management API TypeScript Client
 * Helper functions for managing Supabase edge functions
 */

import axios, { AxiosInstance } from 'axios';

// Types for Supabase Management API
export interface EdgeFunction {
  id: string;
  slug: string;
  version: number;
  created_at: string;
  updated_at: string;
  verify_jwt: boolean;
  entrypoint_path: string;
}

export interface EdgeFunctionDeployment {
  id: string;
  function_slug: string;
  status: 'DEPLOYED' | 'DEPLOYING' | 'FAILED';
  created_at: string;
}

export interface EdgeFunctionSecret {
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ManagementApiError {
  message: string;
  error: string;
  statusCode: number;
}

/**
 * Supabase Management API Client
 */
export class SupabaseManagementClient {
  private client: AxiosInstance;
  private projectRef: string;

  constructor(accessToken: string, projectRef: string) {
    this.projectRef = projectRef;
    this.client = axios.create({
      baseURL: 'https://api.supabase.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorData: ManagementApiError = {
          message: error.response?.data?.message || error.message,
          error: error.response?.data?.error || 'Unknown error',
          statusCode: error.response?.status || 500
        };
        return Promise.reject(errorData);
      }
    );
  }

  /**
   * List all edge functions for the project
   */
  async listEdgeFunctions(): Promise<EdgeFunction[]> {
    try {
      const response = await this.client.get(`/v1/projects/${this.projectRef}/functions`);
      return response.data;
    } catch (error) {
      console.error('Failed to list edge functions:', error);
      throw error;
    }
  }

  /**
   * Get a specific edge function by slug
   */
  async getEdgeFunction(slug: string): Promise<EdgeFunction | null> {
    try {
      const response = await this.client.get(`/v1/projects/${this.projectRef}/functions/${slug}`);
      return response.data;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      console.error(`Failed to get edge function ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Deploy an edge function using eszip bundle
   */
  async deployEdgeFunction(
    slug: string,
    eszipFile: Buffer,
    options: {
      entrypointPath?: string;
      verifyJWT?: boolean;
      importMapPath?: string;
    } = {}
  ): Promise<EdgeFunctionDeployment> {
    try {
      const FormData = require('form-data');
      const form = new FormData();
      
      // Add the eszip file
      form.append('eszip', eszipFile, {
        filename: `${slug}.eszip`,
        contentType: 'application/octet-stream'
      });
      
      // Add metadata
      const metadata = {
        verify_jwt: options.verifyJWT ?? true,
        entrypoint_path: options.entrypointPath || `index.ts`
      };
      
      if (options.importMapPath) {
        (metadata as any).import_map_path = options.importMapPath;
      }
      
      form.append('metadata', JSON.stringify(metadata));

      // Deploy the function
      const response = await this.client.post(
        `/v1/projects/${this.projectRef}/functions/${slug}`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.client.defaults.headers['Authorization']?.toString().split(' ')[1]}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Failed to deploy edge function ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Delete an edge function
   */
  async deleteEdgeFunction(slug: string): Promise<void> {
    try {
      await this.client.delete(`/v1/projects/${this.projectRef}/functions/${slug}`);
      console.log(`Edge function ${slug} deleted successfully`);
    } catch (error: any) {
      if (error.statusCode !== 404) {
        console.error(`Failed to delete edge function ${slug}:`, error);
        throw error;
      }
    }
  }

  /**
   * Set secrets for edge functions
   */
  async setSecrets(secrets: Record<string, string>): Promise<void> {
    try {
      const secretsArray = Object.entries(secrets).map(([name, value]) => ({
        name,
        value
      }));

      await this.client.put(
        `/v1/projects/${this.projectRef}/secrets/bulk`,
        secretsArray
      );
      
      console.log(`Successfully set ${secretsArray.length} secret(s)`);
    } catch (error) {
      console.error('Failed to set secrets:', error);
      throw error;
    }
  }

  /**
   * List all secrets (names only, values are not returned)
   */
  async listSecrets(): Promise<EdgeFunctionSecret[]> {
    try {
      const response = await this.client.get(`/v1/projects/${this.projectRef}/secrets`);
      return response.data;
    } catch (error) {
      console.error('Failed to list secrets:', error);
      throw error;
    }
  }

  /**
   * Delete a secret
   */
  async deleteSecret(name: string): Promise<void> {
    try {
      await this.client.delete(`/v1/projects/${this.projectRef}/secrets/${name}`);
      console.log(`Secret ${name} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete secret ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(functionSlug: string, deploymentId: string): Promise<EdgeFunctionDeployment> {
    try {
      const response = await this.client.get(
        `/v1/projects/${this.projectRef}/functions/${functionSlug}/deployments/${deploymentId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get deployment status:`, error);
      throw error;
    }
  }

  /**
   * List deployments for a function
   */
  async listDeployments(functionSlug: string): Promise<EdgeFunctionDeployment[]> {
    try {
      const response = await this.client.get(
        `/v1/projects/${this.projectRef}/functions/${functionSlug}/deployments`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to list deployments:`, error);
      throw error;
    }
  }
}

/**
 * Helper function to create a management client from environment variables
 */
export function createManagementClient(): SupabaseManagementClient {
  const accessToken = process.env.SUPABASE_MANAGEMENT_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  if (!accessToken || !projectRef) {
    throw new Error(
      'Missing required environment variables: SUPABASE_MANAGEMENT_ACCESS_TOKEN and SUPABASE_PROJECT_REF'
    );
  }

  return new SupabaseManagementClient(accessToken, projectRef);
}