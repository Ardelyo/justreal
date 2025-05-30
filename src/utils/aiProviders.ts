
import { Provider } from '@/types/analysis';

export const providers: Provider[] = [
  { 
    value: 'openai', 
    label: 'OpenAI', 
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  { 
    value: 'gemini', 
    label: 'Google Gemini', 
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  { 
    value: 'openrouter', 
    label: 'OpenRouter', 
    models: ['meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free', 'microsoft/phi-3-mini-128k-instruct:free'],
    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  { 
    value: 'huggingface', 
    label: 'Hugging Face', 
    models: ['microsoft/DialoGPT-medium', 'google/flan-t5-large', 'meta-llama/Llama-2-7b-chat-hf'],
    endpoint: 'https://api-inference.huggingface.co/models'
  }
];
