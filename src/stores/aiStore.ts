
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIState {
  selectedModel: string;
  apiKeys: Record<string, string>;
  modelSettings: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
  learningData: Array<{
    input: string;
    predicted: string;
    actual: string;
    feedback: 'correct' | 'incorrect';
    timestamp: number;
  }>;
  setSelectedModel: (model: string) => void;
  setApiKey: (provider: string, key: string) => void;
  updateModelSettings: (settings: Partial<AIState['modelSettings']>) => void;
  addLearningData: (data: Omit<AIState['learningData'][0], 'timestamp'>) => void;
  getAccuracyMetrics: () => { total: number; correct: number; accuracy: number };
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      selectedModel: 'gpt-4o-mini',
      apiKeys: {},
      modelSettings: {
        temperature: 0.2,
        maxTokens: 1000,
        topP: 0.9,
      },
      learningData: [],
      
      setSelectedModel: (model) => set({ selectedModel: model }),
      
      setApiKey: (provider, key) => 
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key }
        })),
      
      updateModelSettings: (settings) =>
        set((state) => ({
          modelSettings: { ...state.modelSettings, ...settings }
        })),
      
      addLearningData: (data) =>
        set((state) => ({
          learningData: [
            ...state.learningData,
            { ...data, timestamp: Date.now() }
          ].slice(-1000) // Keep last 1000 entries
        })),
      
      getAccuracyMetrics: () => {
        const data = get().learningData;
        const correct = data.filter(d => d.feedback === 'correct').length;
        return {
          total: data.length,
          correct,
          accuracy: data.length > 0 ? (correct / data.length) * 100 : 0
        };
      }
    }),
    {
      name: 'ai-store'
    }
  )
);
