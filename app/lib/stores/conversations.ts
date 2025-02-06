import { atom } from 'nanostores';
import { supabase } from '../supabase/client';
import type { Message } from 'ai';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export const conversationsStore = {
  currentConversation: atom<Conversation | null>(null),

  async createConversation(title: string, initialMessage: Message) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          messages: [initialMessage],
          user_id: user.id // Add the user_id field
        })
        .select()
        .single();

      if (error) throw error;
      
      this.currentConversation.set(data);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async updateConversation(id: string, messages: Message[]) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ messages })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      this.currentConversation.set(data);
      return data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  },

  async getConversation(id: string) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;

      this.currentConversation.set(data);
      return data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  async listConversations() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select()
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error listing conversations:', error);
      throw error;
    }
  }
};