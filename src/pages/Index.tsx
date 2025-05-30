
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, Shield, Brain, Target, Upload, FileSpreadsheet, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedAnalysisResults from '@/components/EnhancedAnalysisResults';
import AboutSection from '@/components/AboutSection';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import TransparencyModal from '@/components/TransparencyModal';

interface AnalysisResult {
  original_comment: string;
  klasifikasi: string[];
  skor_kepercayaan: {
    UJARAN_KEBENCIAN: number;
    BUZZER: number;
    SDM_RENDAH: number;
    NETRAL_POSITIF: number;
  };
  penjelasan_singkat: string;
}

interface BatchResult {
  results: AnalysisResult[];
  total: number;
  processed: number;
}

const Index = () => {
  const [provider, setProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult | null>(null);
  const [uploadedData, setUploadedData] = useState<string[]>([]);
  const [showTransparency, setShowTransparency] = useState<boolean>(false);
  const { toast } = useToast();

  const providers = [
    { 
      value: 'openai', 
      label: 'OpenAI', 
      models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
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
      models: ['meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free', 'microsoft/phi-3-mini-128k-instruct:free', 'meta-llama/llama-3.2-3b-instruct:free'],
      endpoint: 'https://openrouter.ai/api/v1/chat/completions'
    },
    { 
      value: 'huggingface', 
      label: 'Hugging Face', 
      models: ['microsoft/DialoGPT-medium', 'google/flan-t5-large', 'meta-llama/Llama-2-7b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
      endpoint: 'https://api-inference.huggingface.co/models'
    }
  ];

  const getCurrentModels = () => {
    const currentProvider = providers.find(p => p.value === provider);
    return currentProvider ? currentProvider.models : [];
  };

  const getEffectiveModel = () => {
    return customModel.trim() || model || getCurrentModels()[0] || '';
  };

  const analyzeComment = async (commentText: string): Promise<AnalysisResult> => {
    const systemPrompt = `Anda adalah REAL (Rangkaian Evaluasi Anti-Lidah), sebuah model AI yang dilatih khusus untuk menganalisis dan mengklasifikasikan komentar berbahasa Indonesia. Tugas Anda adalah membaca komentar yang diberikan dengan saksama dan menentukan apakah komentar tersebut termasuk dalam satu atau lebih kategori berikut: UJARAN_KEBENCIAN, BUZZER, SDM_RENDAH, atau NETRAL_POSITIF.

Definisi Kategori:
1. UJARAN_KEBENCIAN: Komentar yang secara eksplisit atau implisit menyerang, merendahkan, menghina, mengancam, atau mempromosikan diskriminasi terhadap individu atau kelompok berdasarkan atribut seperti suku, agama, ras, etnis, warna kulit, asal-usul kebangsaan, jenis kelamin, identitas gender, orientasi seksual, disabilitas, kondisi medis, atau status sosial-ekonomi.

2. BUZZER: Komentar yang menunjukkan ciri-ciri aktivitas terkoordinasi, manipulatif, atau tidak organik. Ciri-cirinya bisa meliputi pola komentar seragam, promosi berlebihan, penggunaan tagar tidak relevan secara masif, komentar copy-paste, atau narasi yang terlalu positif/negatif secara tidak wajar.

3. SDM_RENDAH: Komentar yang menunjukkan kualitas interaksi yang buruk, tidak sopan, atau tidak kontributif, termasuk bahasa kasar/vulgar, provokasi murahan, ad hominem, tidak relevan (OOT), komentar dangkal, misinformasi sederhana, atau toxic umum.

4. NETRAL_POSITIF: Komentar yang tidak termasuk dalam kategori di atas, seperti opini sopan, pertanyaan, fakta, apresiasi, dukungan, atau kritik konstruktif.

Berikan output HANYA dalam format JSON yang valid dengan kunci:
- "klasifikasi": array string nama kategori
- "skor_kepercayaan": objek dengan keempat kategori sebagai kunci dan skor 0.0-1.0 sebagai nilai
- "penjelasan_singkat": string singkat alasan klasifikasi (maksimal 2 kalimat)

Analisis komentar berikut: "${commentText}"`;

    const effectiveModel = getEffectiveModel();
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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: commentText }
            ],
            temperature: 0.3,
            max_tokens: 500
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
              parts: [{ text: `${systemPrompt}\n\nKomentar: ${commentText}` }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
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
            'X-Title': 'JustReal Analysis'
          },
          body: JSON.stringify({
            model: effectiveModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: commentText }
            ],
            temperature: 0.3,
            max_tokens: 500
          }),
        });
      } else if (provider === 'huggingface') {
        response = await fetch(`https://api-inference.huggingface.co/models/${effectiveModel}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `${systemPrompt}\n\nKomentar: ${commentText}`,
            parameters: {
              temperature: 0.3,
              max_new_tokens: 500,
              return_full_text: false
            }
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
      } else if (provider === 'huggingface') {
        aiResponse = data[0]?.generated_text || data.generated_text || '';
      }

      console.log('AI Response:', aiResponse);

      // Try to parse JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return {
          original_comment: commentText,
          klasifikasi: parsedResult.klasifikasi || ['NETRAL_POSITIF'],
          skor_kepercayaan: parsedResult.skor_kepercayaan || {
            UJARAN_KEBENCIAN: 0.1,
            BUZZER: 0.1,
            SDM_RENDAH: 0.1,
            NETRAL_POSITIF: 0.7
          },
          penjelasan_singkat: parsedResult.penjelasan_singkat || 'Analisis berhasil dilakukan.'
        };
      } else {
        // Fallback if JSON parsing fails
        console.warn('Failed to parse JSON response, using fallback');
        return {
          original_comment: commentText,
          klasifikasi: ['NETRAL_POSITIF'],
          skor_kepercayaan: {
            UJARAN_KEBENCIAN: 0.1,
            BUZZER: 0.1,
            SDM_RENDAH: 0.2,
            NETRAL_POSITIF: 0.6
          },
          penjelasan_singkat: 'Respons AI tidak dalam format yang diharapkan, menggunakan klasifikasi default.'
        };
      }
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const handleAnalyzeSingle = async () => {
    if (!provider || !apiKey || !comment.trim()) {
      toast({
        title: "Error",
        description: "Mohon lengkapi penyedia AI, API key, dan komentar yang ingin dianalisis",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setBatchResults(null);
    
    try {
      const analysisResult = await analyzeComment(comment);
      setResult(analysisResult);
      toast({
        title: "Analisis Selesai",
        description: "Komentar berhasil dianalisis menggunakan sistem REAL",
        duration: 3000
      });
    } catch (error) {
      console.error('Single analysis error:', error);
      toast({
        title: "Error",
        description: `Terjadi kesalahan saat menganalisis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeBatch = async () => {
    if (!provider || !apiKey || uploadedData.length === 0) {
      toast({
        title: "Error",
        description: "Mohon lengkapi penyedia AI, API key, dan upload file terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const results: AnalysisResult[] = [];
      
      // Initialize batch results
      setBatchResults({
        results: [],
        total: uploadedData.length,
        processed: 0
      });
      
      for (let i = 0; i < uploadedData.length; i++) {
        const commentText = uploadedData[i];
        if (commentText.trim()) {
          try {
            const analysisResult = await analyzeComment(commentText);
            results.push(analysisResult);
            
            // Update progress
            setBatchResults({
              results: [...results],
              total: uploadedData.length,
              processed: i + 1
            });
            
            // Small delay to avoid rate limiting and provide visual feedback
            if (i < uploadedData.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (error) {
            console.error(`Error analyzing comment ${i + 1}:`, error);
            // Continue with next comment even if one fails
          }
        }
      }
      
      // Final update
      setBatchResults({
        results,
        total: uploadedData.length,
        processed: uploadedData.length
      });
      
      toast({
        title: "Analisis Batch Selesai",
        description: `${results.length} dari ${uploadedData.length} komentar berhasil dianalisis`,
        duration: 5000
      });
    } catch (error) {
      console.error('Batch analysis error:', error);
      toast({
        title: "Error",
        description: `Terjadi kesalahan saat analisis batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearResults = () => {
    setResult(null);
    setBatchResults(null);
    setComment('');
    setUploadedData([]);
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
              <span className="gradient-text">JustReal</span>
            </h1>
            <Sparkles className="w-8 h-8 text-justreal-red ml-3" />
          </div>
          <p className="text-xl text-justreal-gray-light mb-2">
            Rangkaian Evaluasi Anti-Lidah yang Lebih Sederhana dan Langsung
          </p>
          <p className="text-justreal-gray-light mb-6">
            Analisis Komentar Cerdas, Ruang Digital Sehat dengan AI Transparan
          </p>
          
          {/* Enhanced Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Brain className="w-4 h-4 mr-2" />
              AI Multi-Provider
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Shield className="w-4 h-4 mr-2" />
              100% Transparan
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Target className="w-4 h-4 mr-2" />
              Akurasi Tinggi
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <Eye className="w-4 h-4 mr-2" />
              Privacy-First
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-colors">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Batch Processing
            </Badge>
          </div>

          {/* Transparency Button */}
          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowTransparency(true)}
              className="border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white transition-all duration-300"
            >
              <Eye className="w-4 h-4 mr-2" />
              Lihat Cara Kerja & Sistem Instruksi REAL
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-justreal-dark border-justreal-gray card-glow mb-6">
              <CardHeader>
                <CardTitle className="text-justreal-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-justreal-red" />
                  Konfigurasi AI & Model
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
                  <p className="text-xs text-justreal-gray-light mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    API key tidak disimpan dan hanya digunakan untuk sesi ini
                  </p>
                </div>

                {provider && (
                  <div>
                    <Label htmlFor="model" className="text-justreal-white mb-2 block">Model (Rekomendasi)</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white hover:border-justreal-red transition-colors">
                        <SelectValue placeholder="Pilih model..." />
                      </SelectTrigger>
                      <SelectContent className="bg-justreal-dark border-justreal-gray">
                        {getCurrentModels().map((m) => (
                          <SelectItem key={m} value={m} className="text-justreal-white focus:bg-justreal-red">
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="customModel" className="text-justreal-white mb-2 block">Model Kustom (Opsional)</Label>
                  <Input
                    id="customModel"
                    placeholder="misal: gpt-4-turbo-preview"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light focus:border-justreal-red transition-colors"
                  />
                  <p className="text-xs text-justreal-gray-light mt-1">
                    Akan menggantikan model yang dipilih di atas
                  </p>
                </div>

                {getEffectiveModel() && (
                  <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
                    <p className="text-sm text-justreal-gray-light mb-1">Model yang akan digunakan:</p>
                    <p className="text-justreal-white font-mono text-sm font-semibold">{getEffectiveModel()}</p>
                    <p className="text-xs text-justreal-gray-light mt-1">
                      Provider: {providers.find(p => p.value === provider)?.label}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <AboutSection />
          </div>

          {/* Enhanced Analysis Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-justreal-dark border-justreal-gray card-glow mb-6">
              <CardHeader>
                <CardTitle className="text-justreal-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-justreal-red" />
                  Analisis Komentar Berbasis AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="single" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-justreal-black mb-6">
                    <TabsTrigger 
                      value="single" 
                      className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                    >
                      Komentar Tunggal
                    </TabsTrigger>
                    <TabsTrigger 
                      value="batch" 
                      className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File / Batch
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="single" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="comment" className="text-justreal-white mb-3 block">Komentar untuk Dianalisis</Label>
                      <Textarea
                        id="comment"
                        placeholder="Masukkan atau tempelkan komentar yang ingin dianalisis oleh sistem REAL..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light min-h-[140px] focus:border-justreal-red transition-colors resize-none"
                        maxLength={2000}
                      />
                      <p className="text-xs text-justreal-gray-light mt-2">
                        {comment.length}/2000 karakter
                      </p>
                    </div>

                    <Button
                      onClick={handleAnalyzeSingle}
                      disabled={isAnalyzing || !provider || !apiKey || !comment.trim()}
                      className="w-full bg-justreal-red hover:bg-justreal-red-dark text-white font-semibold py-4 text-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Menganalisis dengan AI...
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5 mr-2" />
                          Analisis Sekarang
                        </>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="batch" className="space-y-4 mt-4">
                    <EnhancedFileUpload onDataLoaded={setUploadedData} />
                    
                    {uploadedData.length > 0 && (
                      <div className="bg-justreal-black p-6 rounded-lg border border-justreal-gray">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-justreal-white font-semibold mb-1">
                              <FileSpreadsheet className="w-5 h-5 inline mr-2" />
                              Data Siap untuk Analisis
                            </p>
                            <p className="text-justreal-gray-light">
                              {uploadedData.length} komentar telah dimuat dan siap diproses
                            </p>
                          </div>
                          <Badge className="bg-justreal-red text-white px-3 py-1 text-lg font-semibold">
                            {uploadedData.length}
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={handleAnalyzeBatch}
                          disabled={isAnalyzing || !provider || !apiKey}
                          className="w-full bg-justreal-red hover:bg-justreal-red-dark text-white font-semibold py-4 text-lg transition-all duration-300 disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Menganalisis Batch ({batchResults?.processed || 0}/{uploadedData.length})...
                            </>
                          ) : (
                            <>
                              <Brain className="w-5 h-5 mr-2" />
                              Mulai Analisis Batch
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Enhanced Results */}
            {(result || batchResults) && (
              <EnhancedAnalysisResults 
                result={result} 
                batchResults={batchResults}
                onClearResults={handleClearResults}
              />
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
