
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, Brain, Target, Sparkles, Zap, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataVisualization from '@/components/DataVisualization';
import CommentPasteArea from '@/components/CommentPasteArea';
import WordAnalysis from '@/components/WordAnalysis';
import EfficiencyMode from '@/components/EfficiencyMode';
import Credits from '@/components/Credits';
import TransparencyModal from '@/components/TransparencyModal';

interface AnalysisResult {
  original_comment: string;
  klasifikasi: string[];
  skor_kepercayaan: {
    UJARAN_KEBENCIAN: number;
    BUZZER: number;
    SDM_RENDAH: number;
    NETRAL_POSITIF: number;
    POSITIF: number;
    NEGATIF: number;
    NETRAL: number;
  };
  penjelasan_singkat: string;
  sentimen_umum: 'POSITIF' | 'NEGATIF' | 'NETRAL';
  tingkat_toksisitas: number;
}

const Index = () => {
  const [provider, setProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('');
  const [comments, setComments] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [showTransparency, setShowTransparency] = useState<boolean>(false);
  const [efficiencyMode, setEfficiencyMode] = useState<boolean>(true);
  const { toast } = useToast();

  const providers = [
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

  const getEnhancedSystemPrompt = (commentsToAnalyze: string[]) => {
    const isBatch = commentsToAnalyze.length > 1;
    
    return `Anda adalah REAL (Rangkaian Evaluasi Anti-Lidah) versi 2.0, sebuah sistem AI analisis sentimen dan moderasi konten berbahasa Indonesia yang sangat canggih dan presisi.

KEMAMPUAN ANALISIS ANDA:
- Analisis sentimen multi-dimensional (POSITIF, NEGATIF, NETRAL)
- Deteksi ujaran kebencian dan konten toksik
- Identifikasi aktivitas buzzer dan manipulasi
- Penilaian kualitas konten dan tingkat pendidikan
- Analisis konteks budaya dan linguistik Indonesia

KATEGORI KLASIFIKASI LENGKAP:
1. POSITIF: Komentar konstruktif, dukungan, apresiasi, saran membangun, informasi bermanfaat
2. NEGATIF: Kritik tanpa solusi, pesimisme, keluhan berlebihan, emosi negatif yang wajar
3. NETRAL: Komentar informatif, pertanyaan, statement faktual tanpa bias emosional
4. UJARAN_KEBENCIAN: Diskriminasi SARA, ancaman, hasutan, dehumanisasi kelompok tertentu
5. BUZZER: Pola terkoordinasi, propaganda, astroturfing, manipulasi opini publik
6. SDM_RENDAH: Bahasa vulgar, logika lemah, misinformasi, ad hominem, tidak konstruktif

INSTRUKSI ANALISIS ${isBatch ? 'BATCH' : 'TUNGGAL'}:
${isBatch ? `
Anda akan menganalisis ${commentsToAnalyze.length} komentar sekaligus. Untuk setiap komentar, berikan analisis lengkap dengan mempertimbangkan konteks dan pola keseluruhan.
` : `
Anda akan menganalisis 1 komentar dengan detail dan presisi tinggi.
`}

METODOLOGI ANALISIS:
1. Pembacaan komprehensif dengan pemahaman konteks budaya Indonesia
2. Identifikasi kata kunci, frasa, dan pattern komunikasi
3. Analisis sentiment dengan skala confidence 0.0-1.0
4. Evaluasi tingkat toksisitas (0.0 = sangat aman, 1.0 = sangat toksik)
5. Penentuan sentimen umum dominan
6. Penjelasan reasoning yang detail dan dapat dipertanggungjawabkan

OUTPUT FORMAT JSON YANG DIBUTUHKAN:
${isBatch ? `
{
  "batch_results": [` : ''}
    {
      "klasifikasi": ["KATEGORI_UTAMA", "KATEGORI_SEKUNDER"],
      "skor_kepercayaan": {
        "POSITIF": 0.0-1.0,
        "NEGATIF": 0.0-1.0,
        "NETRAL": 0.0-1.0,
        "UJARAN_KEBENCIAN": 0.0-1.0,
        "BUZZER": 0.0-1.0,
        "SDM_RENDAH": 0.0-1.0
      },
      "sentimen_umum": "POSITIF|NEGATIF|NETRAL",
      "tingkat_toksisitas": 0.0-1.0,
      "penjelasan_singkat": "Penjelasan detail reasoning dalam 2-3 kalimat"
    }${isBatch ? `
  ]
}` : ''}

CRITICAL: 
- Berikan HANYA output JSON yang valid
- Skor confidence harus realistis dan akurat
- Penjelasan harus spesifik dan detail
- Pertimbangkan nuansa bahasa Indonesia dan konteks budaya
- Fokus pada akurasi daripada kecepatan

${isBatch ? `
Komentar yang akan dianalisis:
${commentsToAnalyze.map((comment, index) => `${index + 1}. "${comment}"`).join('\n')}
` : `
Komentar yang akan dianalisis: "${commentsToAnalyze[0]}"
`}`;
  };

  const analyzeComments = async (commentsToAnalyze: string[]): Promise<AnalysisResult[]> => {
    const effectiveModel = customModel.trim() || model || providers.find(p => p.value === provider)?.models[0] || '';
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

      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        
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
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!provider || !apiKey || comments.length === 0) {
      toast({
        title: "Error",
        description: "Mohon lengkapi penyedia AI, API key, dan tambahkan komentar untuk dianalisis",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResults([]);
    setProcessedCount(0);
    
    try {
      if (efficiencyMode && comments.length > 1) {
        // Batch processing
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < comments.length; i += batchSize) {
          batches.push(comments.slice(i, i + batchSize));
        }
        
        const allResults: AnalysisResult[] = [];
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const batchResults = await analyzeComments(batch);
          allResults.push(...batchResults);
          
          setProcessedCount(allResults.length);
          setResults([...allResults]);
          
          // Small delay between batches
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        setResults(allResults);
      } else {
        // Process individually or single comment
        const allResults: AnalysisResult[] = [];
        
        for (let i = 0; i < comments.length; i++) {
          const result = await analyzeComments([comments[i]]);
          allResults.push(...result);
          
          setProcessedCount(i + 1);
          setResults([...allResults]);
          
          if (i < comments.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
      }
      
      toast({
        title: "Analisis Selesai",
        description: `${comments.length} komentar berhasil dianalisis menggunakan sistem REAL v2.0`,
        duration: 5000
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: `Terjadi kesalahan saat menganalisis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setComments([]);
    setProcessedCount(0);
    toast({
      title: "Hasil dibersihkan",
      description: "Semua hasil analisis telah dihapus"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-justreal-black via-justreal-dark to-justreal-black">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center items-center mb-4">
            <Sparkles className="w-8 h-8 text-justreal-red mr-3" />
            <h1 className="text-6xl font-bold">
              <span className="gradient-text">JustReal v2.0</span>
            </h1>
            <Sparkles className="w-8 h-8 text-justreal-red ml-3" />
          </div>
          <p className="text-xl text-justreal-gray-light mb-2">
            Enhanced AI Comment Analysis with Advanced NLP
          </p>
          <p className="text-justreal-gray-light mb-6">
            Sistem Analisis Komentar Cerdas dengan Deteksi Sentimen Multi-Dimensional
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Brain className="w-4 h-4 mr-2" />
              Enhanced AI v2.0
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Shield className="w-4 h-4 mr-2" />
              Multi-Sentiment Analysis
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Target className="w-4 h-4 mr-2" />
              Word-Level Detection
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Zap className="w-4 h-4 mr-2" />
              Efficiency Mode
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Hash className="w-4 h-4 mr-2" />
              Batch Processing
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-justreal-dark border-justreal-gray card-glow">
              <CardHeader>
                <CardTitle className="text-justreal-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-justreal-red" />
                  Konfigurasi AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider" className="text-justreal-white mb-2 block">Penyedia LLM</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white hover:border-justreal-red transition-colors">
                      <SelectValue placeholder="Pilih penyedia AI..." />
                    </SelectTrigger>
                    <SelectContent className="bg-justreal-dark border-justreal-gray">
                      {providers.map((p) => (
                        <SelectItem key={p.value} value={p.value} className="text-justreal-white focus:bg-justreal-red">
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="apikey" className="text-justreal-white mb-2 block">API Key</Label>
                  <Input
                    id="apikey"
                    type="password"
                    placeholder="Masukkan API key Anda..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light focus:border-justreal-red transition-colors"
                  />
                </div>

                {provider && (
                  <div>
                    <Label htmlFor="model" className="text-justreal-white mb-2 block">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white hover:border-justreal-red transition-colors">
                        <SelectValue placeholder="Pilih model..." />
                      </SelectTrigger>
                      <SelectContent className="bg-justreal-dark border-justreal-gray">
                        {providers.find(p => p.value === provider)?.models.map((m) => (
                          <SelectItem key={m} value={m} className="text-justreal-white focus:bg-justreal-red">
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="customModel" className="text-justreal-white mb-2 block">Model Kustom</Label>
                  <Input
                    id="customModel"
                    placeholder="Model kustom..."
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light focus:border-justreal-red transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            <EfficiencyMode 
              enabled={efficiencyMode}
              onToggle={setEfficiencyMode}
              commentCount={comments.length}
            />

            <Credits />
          </div>

          {/* Main Analysis Panel */}
          <div className="lg:col-span-3 space-y-6">
            <CommentPasteArea 
              comments={comments}
              onCommentsChange={setComments}
            />

            {comments.length > 0 && (
              <Card className="bg-justreal-dark border-justreal-gray card-glow">
                <CardHeader>
                  <CardTitle className="text-justreal-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-justreal-red" />
                    Mulai Analisis Enhanced REAL v2.0
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !provider || !apiKey}
                    className="w-full bg-justreal-red hover:bg-justreal-red-dark text-white font-semibold py-4 text-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Menganalisis... ({processedCount}/{comments.length})
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Analisis {comments.length} Komentar dengan AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {results.length > 0 && (
              <Tabs defaultValue="visualization" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-justreal-black mb-6">
                  <TabsTrigger 
                    value="visualization" 
                    className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                  >
                    Data Visualization
                  </TabsTrigger>
                  <TabsTrigger 
                    value="words" 
                    className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                  >
                    Word Analysis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="table" 
                    className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                  >
                    Detailed Table
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="visualization" className="mt-4">
                  <DataVisualization results={results} />
                </TabsContent>
                
                <TabsContent value="words" className="mt-4">
                  <WordAnalysis analysisResults={results} />
                </TabsContent>
                
                <TabsContent value="table" className="mt-4">
                  {/* Table view will be handled by existing components */}
                  <DataVisualization results={results} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      <TransparencyModal 
        open={showTransparency} 
        onOpenChange={setShowTransparency} 
      />
    </div>
  );
};

export default Index;
