
import { AnalysisResult } from '@/types/analysis';
import { getEnhancedSystemPrompt } from '@/utils/systemPrompt';
import { useAIStore } from '@/stores/aiStore';
import { tensorflowService } from './tensorflowService';

interface AIProvider {
  name: string;
  models: string[];
  endpoint: string;
  headers: (apiKey: string) => Record<string, string>;
  formatRequest: (prompt: string, model: string, settings: any) => any;
  parseResponse: (response: any) => string;
}

const providers: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    formatRequest: (prompt, model, settings) => ({
      model,
      messages: [{ role: 'system', content: prompt }],
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      top_p: settings.topP,
    }),
    parseResponse: (response) => response.choices[0]?.message?.content || '',
  },
  
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    headers: () => ({ 'Content-Type': 'application/json' }),
    formatRequest: (prompt, model, settings) => ({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: settings.temperature,
        maxOutputTokens: settings.maxTokens,
        topP: settings.topP,
      },
    }),
    parseResponse: (response) => response.candidates[0]?.content?.parts[0]?.text || '',
  },
  
  claude: {
    name: 'Anthropic Claude',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    }),
    formatRequest: (prompt, model, settings) => ({
      model,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      top_p: settings.topP,
      messages: [{ role: 'user', content: prompt }],
    }),
    parseResponse: (response) => response.content[0]?.text || '',
  },
};

export class MultiModelAI {
  private static instance: MultiModelAI;
  
  static getInstance(): MultiModelAI {
    if (!MultiModelAI.instance) {
      MultiModelAI.instance = new MultiModelAI();
    }
    return MultiModelAI.instance;
  }

  async analyzeComments(
    comments: string[],
    provider: string,
    model: string,
    apiKey: string,
    efficiencyMode: boolean = true
  ): Promise<AnalysisResult[]> {
    const aiProvider = providers[provider];
    if (!aiProvider) {
      throw new Error(`Provider ${provider} not supported`);
    }

    const { modelSettings } = useAIStore.getState();
    const systemPrompt = getEnhancedSystemPrompt(comments);
    
    try {
      // Get AI analysis
      const aiResults = await this.callAIProvider(
        aiProvider,
        apiKey,
        model,
        systemPrompt,
        modelSettings
      );

      // Enhance with TensorFlow.js analysis
      const enhancedResults = await this.enhanceWithTensorFlow(comments, aiResults);
      
      // Learn from results for model improvement
      this.updateLearningData(comments, enhancedResults);
      
      return enhancedResults;
    } catch (error) {
      console.error('Multi-model AI analysis failed:', error);
      throw error;
    }
  }

  private async callAIProvider(
    provider: AIProvider,
    apiKey: string,
    model: string,
    prompt: string,
    settings: any
  ): Promise<AnalysisResult[]> {
    let endpoint = provider.endpoint;
    
    // Handle provider-specific endpoint formatting
    if (provider.name === 'Google Gemini') {
      endpoint = `${endpoint}/${model}:generateContent?key=${apiKey}`;
    }

    const requestBody = provider.formatRequest(prompt, model, settings);
    const headers = provider.headers(apiKey);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = provider.parseResponse(data);
    
    // Parse JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const parsedResult = JSON.parse(jsonMatch[0]);
    
    if (parsedResult.batch_results) {
      return parsedResult.batch_results;
    } else {
      return [parsedResult];
    }
  }

  private async enhanceWithTensorFlow(
    comments: string[],
    aiResults: AnalysisResult[]
  ): Promise<AnalysisResult[]> {
    const enhancedResults: AnalysisResult[] = [];

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const aiResult = aiResults[i] || aiResults[0]; // Fallback to first result
      
      // Get TensorFlow analysis
      const tfAnalysis = await tensorflowService.analyzeSentence(comment);
      
      // Combine AI and TensorFlow results
      const enhancedResult: AnalysisResult = {
        ...aiResult,
        original_comment: comment,
        skor_kepercayaan: {
          ...aiResult.skor_kepercayaan,
          // Blend AI confidence with TensorFlow analysis
          POSITIF: (aiResult.skor_kepercayaan.POSITIF + tfAnalysis.overallSentiment) / 2,
          NEGATIF: (aiResult.skor_kepercayaan.NEGATIF + (1 - tfAnalysis.overallSentiment)) / 2,
          UJARAN_KEBENCIAN: (aiResult.skor_kepercayaan.UJARAN_KEBENCIAN + tfAnalysis.overallToxicity) / 2,
        },
        tingkat_toksisitas: (aiResult.tingkat_toksisitas + tfAnalysis.overallToxicity) / 2,
        // Add TensorFlow-specific analysis
        tensorflow_analysis: {
          emotions: tfAnalysis.emotions,
          wordAnalysis: tfAnalysis.wordAnalysis,
          overallSentiment: tfAnalysis.overallSentiment,
          overallToxicity: tfAnalysis.overallToxicity,
        },
      };
      
      enhancedResults.push(enhancedResult);
    }

    return enhancedResults;
  }

  private updateLearningData(comments: string[], results: AnalysisResult[]) {
    const { addLearningData } = useAIStore.getState();
    
    comments.forEach((comment, index) => {
      const result = results[index];
      if (result) {
        addLearningData({
          input: comment,
          predicted: result.sentimen_umum,
          actual: result.sentimen_umum, // Will be updated with user feedback
          feedback: 'correct', // Default, will be updated with user feedback
        });
      }
    });
  }

  async provideFeedback(
    commentIndex: number,
    actualSentiment: string,
    isCorrect: boolean
  ) {
    const { learningData } = useAIStore.getState();
    const feedbackData = learningData
      .filter(d => d.feedback === (isCorrect ? 'correct' : 'incorrect'))
      .slice(-100) // Last 100 feedback items
      .map(d => ({
        input: d.input,
        expected: this.sentimentToVector(d.actual),
      }));

    if (feedbackData.length > 10) {
      await tensorflowService.trainModel(feedbackData);
    }
  }

  private sentimentToVector(sentiment: string): number[] {
    // Convert sentiment to one-hot vector for training
    const vector = new Array(11).fill(0);
    switch (sentiment) {
      case 'POSITIF': vector[0] = 1; break;
      case 'NEGATIF': vector[1] = 1; break;
      case 'NETRAL': vector[2] = 1; break;
      case 'UJARAN_KEBENCIAN': vector[3] = 1; break;
      default: vector[2] = 1; // Default to neutral
    }
    return vector;
  }

  getAvailableProviders(): string[] {
    return Object.keys(providers);
  }

  getModelsForProvider(provider: string): string[] {
    return providers[provider]?.models || [];
  }
}

export const multiModelAI = MultiModelAI.getInstance();
