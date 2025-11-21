import supabase, { isSupabaseConfigured } from '../supabase';

// Mock storage for development/testing when Supabase is not configured
const mockMemoryStore = {};

/**
 * Upsert a memory entry for an agent
 * @param {string} agentName - The name of the agent
 * @param {string} memoryKey - The key identifier for the memory
 * @param {any} memoryValue - The value to store
 * @param {number} importance - Importance level (0-10)
 * @returns {Promise<Object>} The upserted memory object
 */
export const upsertMemory = async (agentName, memoryKey, memoryValue, importance = 5) => {
  if (!isSupabaseConfigured() || !supabase) {
    // Mock implementation
    const key = `${agentName}:${memoryKey}`;
    mockMemoryStore[key] = {
      agent_name: agentName,
      memory_key: memoryKey,
      memory_value: memoryValue,
      importance: importance,
      updated_at: new Date().toISOString()
    };
    console.log('[Mock] Memory upserted:', key);
    return { data: mockMemoryStore[key], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('agent_memory')
      .upsert({
        agent_name: agentName,
        memory_key: memoryKey,
        memory_value: memoryValue,
        importance: importance
      }, {
        onConflict: 'agent_name,memory_key'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error upserting memory:', error);
    return { data: null, error };
  }
};

/**
 * Get a specific memory entry for an agent
 * @param {string} agentName - The name of the agent
 * @param {string} memoryKey - The key identifier for the memory
 * @returns {Promise<Object>} The memory object if found
 */
export const getMemory = async (agentName, memoryKey) => {
  if (!isSupabaseConfigured() || !supabase) {
    // Mock implementation
    const key = `${agentName}:${memoryKey}`;
    const memory = mockMemoryStore[key];
    console.log('[Mock] Memory retrieved:', key, memory ? 'found' : 'not found');
    return { data: memory || null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_name', agentName)
      .eq('memory_key', memoryKey)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error getting memory:', error);
    return { data: null, error };
  }
};

/**
 * Get all memory entries for a specific agent
 * @param {string} agentName - The name of the agent
 * @returns {Promise<Array>} Array of memory objects
 */
export const getAllMemoryForAgent = async (agentName) => {
  if (!isSupabaseConfigured() || !supabase) {
    // Mock implementation
    const agentMemories = Object.entries(mockMemoryStore)
      .filter(([key, _]) => key.startsWith(`${agentName}:`))
      .map(([_, value]) => value);
    console.log('[Mock] All memories for agent', agentName, ':', agentMemories.length, 'entries');
    return { data: agentMemories, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_name', agentName)
      .order('importance', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting all memory for agent:', error);
    return { data: [], error };
  }
};

/**
 * Delete a specific memory entry
 * @param {string} agentName - The name of the agent
 * @param {string} memoryKey - The key identifier for the memory
 * @returns {Promise<Object>} Success status
 */
export const deleteMemory = async (agentName, memoryKey) => {
  if (!isSupabaseConfigured() || !supabase) {
    // Mock implementation
    const key = `${agentName}:${memoryKey}`;
    delete mockMemoryStore[key];
    console.log('[Mock] Memory deleted:', key);
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('agent_memory')
      .delete()
      .eq('agent_name', agentName)
      .eq('memory_key', memoryKey);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting memory:', error);
    return { success: false, error };
  }
};

/**
 * Clear all memory for a specific agent
 * @param {string} agentName - The name of the agent
 * @returns {Promise<Object>} Success status
 */
export const clearAgentMemory = async (agentName) => {
  if (!isSupabaseConfigured() || !supabase) {
    // Mock implementation
    Object.keys(mockMemoryStore).forEach(key => {
      if (key.startsWith(`${agentName}:`)) {
        delete mockMemoryStore[key];
      }
    });
    console.log('[Mock] All memory cleared for agent:', agentName);
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('agent_memory')
      .delete()
      .eq('agent_name', agentName);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error clearing agent memory:', error);
    return { success: false, error };
  }
};