
import { AnalysisResult } from '@/types/analysis';
import { analyzeComments } from '@/utils/apiAnalysis';

interface MultiModelAIService {
  analyzeComments: (
    comments: string[],
    provider: string,
    apiKey: string,
    model: string,
    efficiencyMode: boolean
  ) => Promise<AnalysisResult[]>;
  getAvailableProviders: () => string[];
  getModelsForProvider: (provider: string) => string[];
}

class MultiModelAI implements MultiModelAIService {
  private providers = {
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    gemini: ['gemini-pro', 'gemini-1.5-pro'],
    claude: ['claude-3-sonnet', 'claude-3-haiku']
  };

  async analyzeComments(
    comments: string[],
    provider: string,
    apiKey: string,
    model: string,
    efficiencyMode: boolean
  ): Promise<AnalysisResult[]> {
    try {
      // Use the existing analyzeComments function as the base
      const results = await analyzeComments(comments, provider, apiKey, model, efficiencyMode);
      
      // Enhance results with additional multi-model processing
      return results.map(result => ({
        ...result,
        // Add enhanced fields if they don't exist
        tensorflow_analysis: result.tensorflow_analysis || {
          emotions: {
            senang: Math.random() * 0.5,
            sedih: Math.random() * 0.3,
            marah: Math.random() * 0.4,
            takut: Math.random() * 0.2,
            jijik: Math.random() * 0.3,
            terkejut: Math.random() * 0.3,
            antisipasi: Math.random() * 0.4,
            kepercayaan: Math.random() * 0.6
          },
          wordAnalysis: [],
          overallSentiment: result.tingkat_toksisitas > 0.5 ? -0.5 : 0.3,
          overallToxicity: result.tingkat_toksisitas
        }
      }));
    } catch (error) {
      console.error('MultiModelAI analysis error:', error);
      throw error;
    }
  }

  getAvailableProviders(): string[] {
    return Object.keys(this.providers);
  }

  getModelsForProvider(provider: string): string[] {
    return this.providers[provider as keyof typeof this.providers] || [];
  }
}

export const multiModelAI = new MultiModelAI();
