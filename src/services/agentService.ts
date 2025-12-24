import { getAuthToken, supabase } from '../lib/supabase';

export interface BackendAgent {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  system_prompt: string;
  mode: 'Enterprise' | 'Founder' | 'Customer' | 'WhiteLabel';
  provider: 'OpenAI' | 'Azure' | 'Dual';
  model: string;
  temperature: number;
  max_tokens: number;
  context_files?: string[]; // Array of file IDs
  is_active: boolean;
  created_at: string;
  updated_at: string;
  file_count?: number;
}

export interface AgentResponse {
  success: boolean;
  data: {
    agents: BackendAgent[];
    agentLimit: number;
    agentCount: number;
  };
  message?: string;
  error?: string;
  timestamp?: string;
}

class AgentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com/api';
  }

  /**
   * Fetch all agents for the current user
   */
  async getAgents(): Promise<BackendAgent[]> {
    try {
      const authToken = await getAuthToken();
      
      // Check if user is authenticated
      if (!authToken) {
        console.log('No auth token found, skipping agent fetch');
        return [];
      }
      
      console.log('🔑 Making agents request with token:', authToken.substring(0, 20) + '...');
      console.log('🌐 Request URL:', `${this.baseUrl}/agents`);
      
      const response = await fetch(`${this.baseUrl}/agents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        // Try to get the error response body
        let errorMessage = `Failed to fetch agents: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('❌ Error response data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
          
          // If token is invalid, try to refresh and retry once
          if (response.status === 401 && errorData.error?.includes('Invalid or expired token')) {
            console.log('🔄 Token invalid, attempting refresh and retry...');
            
            // Force refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (!refreshError && refreshData.session?.access_token) {
              console.log('✅ Session refreshed, retrying request...');
              
              // Retry the request with the new token
              const retryResponse = await fetch(`${this.baseUrl}/agents`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${refreshData.session.access_token}`,
                },
              });
              
              if (retryResponse.ok) {
                const retryData: AgentResponse = await retryResponse.json();
                console.log('✅ Retry successful:', retryData);
                return retryData.data?.agents || [];
              } else {
                console.log('❌ Retry also failed with status:', retryResponse.status);
              }
            }
          }
        } catch {
          console.log('❌ Could not parse error response');
        }
        
        if (response.status === 401) {
          throw new Error('401 Unauthorized - Please log in again');
        } else if (response.status === 403) {
          throw new Error('403 Forbidden - Insufficient permissions');
        } else if (response.status === 404) {
          throw new Error('404 Not Found - Agents endpoint not available');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data: AgentResponse = await response.json();
      console.log('✅ Response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch agents');
      }

      console.log('📊 Agent service response:', {
        success: data.success,
        agentCount: data.data?.agentCount,
        agentsLength: data.data?.agents?.length,
        agentLimit: data.data?.agentLimit
      });

      return data.data?.agents || [];
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error; // Re-throw to let the calling code handle it
    }
  }


  /**
   * Create a new agent
   */
  async createAgent(agentData: Partial<BackendAgent>): Promise<BackendAgent | null> {
    try {
      const authToken = await getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/agents/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Agent creation response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create agent');
      }

      // Handle different response structures
      const agent = data.data?.agent || data.agent || data.data;
      
      if (!agent) {
        console.error('No agent data found in response:', data);
        throw new Error('No agent data returned from server');
      }

      console.log('Created agent data:', agent);
      console.log('Agent context_files:', agent.context_files);
      
      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      return null;
    }
  }


  /**
   * Get files for a specific agent
   */
  async getAgentFiles(agentId: string): Promise<{ id?: string; name?: string; size?: number; mime_type?: string; created_at?: string; text_content?: string }[]> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        console.log('No auth token found, skipping agent files fetch');
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/agents/${agentId}/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401 Unauthorized - Please log in again');
        } else if (response.status === 403) {
          throw new Error('403 Forbidden - Insufficient permissions');
        } else if (response.status === 404) {
          throw new Error('404 Not Found - Agent files not found');
        } else {
          throw new Error(`Failed to fetch agent files: ${response.status} ${response.statusText}`);
        }
      }

      const data: { success: boolean; data?: { files: { id?: string; name?: string; size?: number; mime_type?: string; created_at?: string; text_content?: string }[] }; error?: string } = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch agent files');
      }

      console.log(`📁 Agent service: Fetched ${data.data?.files?.length || 0} files for agent ${agentId}`);
      return data.data?.files || [];
    } catch (error) {
      console.error(`Error fetching agent files for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgentById(agentId: string): Promise<BackendAgent | null> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      const agent = data.data?.agent || data.agent || data.data;
      if (!agent) {
        console.error('No agent data found in response:', data);
        throw new Error('No agent data returned from server');
      }
      
      return agent;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  /**
   * Update an existing agent
   */
  async updateAgent(agentId: string, agentData: Partial<BackendAgent>): Promise<BackendAgent | null> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      console.log('Updating agent with data:', agentData);

      const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Agent update failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Agent update response:', data);

      // Handle different response structures
      const agent = data.data?.agent || data.agent || data.data;
      if (!agent) {
        console.error('No agent data found in response:', data);
        throw new Error('No agent data returned from server');
      }
      
      console.log('Updated agent data:', agent);
      console.log('Agent context_files:', agent.context_files);
      return agent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const authToken = await getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete agent: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.success || false;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }
}

// Export singleton instance
export const agentService = new AgentService();
