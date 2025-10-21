import { create } from 'zustand';
import toast from 'react-hot-toast';

interface EmailSettings {
  host: string;
  port: string;
  sender: string;
  username: string;
  password: string;
}

interface EmailStore {
  settings: EmailSettings;
  isSaving: boolean;
  isSendingTest: boolean;
  isLoadingSettings: boolean;
  error: string | null;
  setSettings: (settings: Partial<EmailSettings>) => void;
  saveSettings: () => Promise<void>;
  sendInvite: (to: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetError: () => void;
}

const initialSettings: EmailSettings = {
  host: '',
  port: '',
  sender: '',
  username: '',
  password: '',
};

export const useEmailStore = create<EmailStore>((set, get) => ({
  settings: initialSettings,
  isSaving: false,
  isSendingTest: false,
  isLoadingSettings: false,
  error: null,
  setSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
  saveSettings: async () => {
    set({ isSaving: true, error: null });
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(get().settings),
      });
      if (!response.ok) {
        throw new Error('Failed to save email settings');
      }
      toast.success('Email settings saved successfully!');
      // Optionally handle response data here
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isSaving: false });
    }
  },
  sendInvite: async (to: string) => {
    set({ isSendingTest: true, error: null });
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...get().settings, recipient: to }),
      });
      if (!response.ok) {
        throw new Error('Failed to send test email');
      }
      toast.success(`Test email sent successfully to ${to}!`);
      // Optionally handle response data here
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isSendingTest: false });
    }
  },
  loadSettings: async () => {
    set({ isLoadingSettings: true, error: null });
    try {
      const response = await fetch('/api/email', {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          set({ settings: data.settings });
        }
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isLoadingSettings: false });
    }
  },
  resetError: () => set({ error: null }),
}));
