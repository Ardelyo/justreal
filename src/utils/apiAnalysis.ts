
import { AnalysisResult } from '@/types/analysis';
import { getEnhancedSystemPrompt } from './systemPrompt';

export const analyzeComments = async (
  commentsToAnalyze: string[],
  provider: string,
  apiKey: string,
  model: string,
  customModel: string,
  efficiencyMode: boolean
): Promise<AnalysisResult[]> => {
  const effectiveModel = customModel.trim() || model;
  const systemPrompt = getEnhancedSystemPrompt(commentsToAnalyze);
  
  console.log('Enhanced System Prompt:', systemPrompt);
  
  let response;

  try {
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: effectiveModel,
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          temperature: 0.2,
          max_tokens: efficiencyMode ? 3000 : 1000
        }),
      });
    } else if (provider === 'gemini') {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: efficiencyMode ? 3000 : 1000,
          }
        }),
      });
    } else if (provider === 'openrouter') {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'JustReal Analysis v2.0'
        },
        body: JSON.stringify({
          model: effectiveModel,
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          temperature: 0.2,
          max_tokens: efficiencyMode ? 3000 : 1000
        }),
      });
    }

    if (!response?.ok) {
      const errorText = await response?.text();
      throw new Error(`API Error: ${response?.status} ${response?.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }

    const data = await response.json();
    let aiResponse = '';

    if (provider === 'openai' || provider === 'openrouter') {
      aiResponse = data.choices[0]?.message?.content || '';
    } else if (provider === 'gemini') {
      aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';
    }

    console.log('Enhanced AI Response:', aiResponse);

    // Improved JSON parsing with better error handling
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    let parsedResult;
    try {
      // Clean the JSON string before parsing
      let jsonString = jsonMatch[0];
      
      // Remove any trailing commas that might cause parsing issues
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      
      // Try to fix common JSON issues
      jsonString = jsonString.replace(/,\s*}/g, '}');
      jsonString = jsonString.replace(/,\s*]/g, ']');
      
      console.log('Cleaned JSON string:', jsonString);
      
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Problematic JSON:', jsonMatch[0]);
      
      // Fallback: create a basic result structure
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
    
    if (parsedResult.batch_results) {
      // Batch response
      return parsedResult.batch_results.map((result: any, index: number) => ({
        original_comment: commentsToAnalyze[index],
        klasifikasi: result.klasifikasi || ['NETRAL'],
        skor_kepercayaan: {
          ...result.skor_kepercayaan,
          NETRAL_POSITIF: result.skor_kepercayaan?.POSITIF || 0.5
        },
        penjelasan_singkat: result.penjelasan_singkat || 'Analisis berhasil dilakukan.',
        sentimen_umum: result.sentimen_umum || 'NETRAL',
        tingkat_toksisitas: result.tingkat_toksisitas || 0.1
      }));
    } else {
      // Single response
      return [{
        original_comment: commentsToAnalyze[0],
        klasifikasi: parsedResult.klasifikasi || ['NETRAL'],
        skor_kepercayaan: {
          ...parsedResult.skor_kepercayaan,
          NETRAL_POSITIF: parsedResult.skor_kepercayaan?.POSITIF || 0.5
        },
        penjelasan_singkat: parsedResult.penjelasan_singkat || 'Analisis berhasil dilakukan.',
        sentimen_umum: parsedResult.sentimen_umum || 'NETRAL',
        tingkat_toksisitas: parsedResult.tingkat_toksisitas || 0.1
      }];
    }
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};
