
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, Shield, Brain, Target, Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AnalysisResults from '@/components/AnalysisResults';
import AboutSection from '@/components/AboutSection';
import FileUpload from '@/components/FileUpload';
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
      models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o'],
      endpoint: 'https://api.openai.com/v1/chat/completions'
    },
    { 
      value: 'gemini', 
      label: 'Google Gemini', 
      models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
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
        throw new Error(`API Error: ${response?.status} ${response?.statusText}`);
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
        description: "Komentar berhasil dianalisis menggunakan sistem REAL"
      });
    } catch (error) {
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
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error analyzing comment ${i + 1}:`, error);
            // Continue with next comment
          }
        }
      }
      
      setBatchResults({
        results,
        total: uploadedData.length,
        processed: uploadedData.length
      });
      
      toast({
        title: "Analisis Batch Selesai",
        description: `${results.length} dari ${uploadedData.length} komentar berhasil dianalisis`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Terjadi kesalahan saat analisis batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-justreal-black via-justreal-dark to-justreal-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4">
            <span className="gradient-text">JustReal</span>
          </h1>
          <p className="text-xl text-justreal-gray-light mb-2">
            Rangkaian Evaluasi Anti-Lidah yang Lebih Sederhana dan Langsung
          </p>
          <p className="text-justreal-gray-light">
            Analisis Komentar Cerdas, Ruang Digital Sehat
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white">
              <Shield className="w-4 h-4 mr-2" />
              Transparent
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white">
              <Target className="w-4 h-4 mr-2" />
              Akurat
            </Badge>
            <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white">
              <Eye className="w-4 h-4 mr-2" />
              Privacy-First
            </Badge>
          </div>

          {/* Transparency Button */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowTransparency(true)}
              className="border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Lihat Cara Kerja & Sistem Instruksi
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-justreal-dark border-justreal-gray card-glow mb-6">
              <CardHeader>
                <CardTitle className="text-justreal-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-justreal-red" />
                  Konfigurasi AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider" className="text-justreal-white">Penyedia LLM</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white">
                      <SelectValue placeholder="Pilih penyedia..." />
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
                  <Label htmlFor="apikey" className="text-justreal-white">API Key</Label>
                  <Input
                    id="apikey"
                    type="password"
                    placeholder="Masukkan API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light"
                  />
                  <p className="text-xs text-justreal-gray-light mt-1">
                    🔒 API key tidak disimpan di server kami
                  </p>
                </div>

                {provider && (
                  <div>
                    <Label htmlFor="model" className="text-justreal-white">Model (Rekomendasi)</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white">
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
                  <Label htmlFor="customModel" className="text-justreal-white">Model Kustom (Opsional)</Label>
                  <Input
                    id="customModel"
                    placeholder="Masukkan nama model kustom..."
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light"
                  />
                  <p className="text-xs text-justreal-gray-light mt-1">
                    Akan menggantikan model yang dipilih di atas
                  </p>
                </div>

                {getEffectiveModel() && (
                  <div className="bg-justreal-black p-3 rounded border border-justreal-gray">
                    <p className="text-sm text-justreal-gray-light">Model yang digunakan:</p>
                    <p className="text-justreal-white font-mono text-sm">{getEffectiveModel()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <AboutSection />
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-justreal-dark border-justreal-gray card-glow mb-6">
              <CardHeader>
                <CardTitle className="text-justreal-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-justreal-red" />
                  Analisis Komentar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="single" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-justreal-black">
                    <TabsTrigger value="single" className="data-[state=active]:bg-justreal-red data-[state=active]:text-white">
                      Komentar Tunggal
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="data-[state=active]:bg-justreal-red data-[state=active]:text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="single" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="comment" className="text-justreal-white">Komentar untuk Dianalisis</Label>
                      <Textarea
                        id="comment"
                        placeholder="Masukkan atau tempelkan komentar yang ingin dianalisis..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light min-h-[120px]"
                      />
                    </div>

                    <Button
                      onClick={handleAnalyzeSingle}
                      disabled={isAnalyzing || !provider || !apiKey || !comment.trim()}
                      className="w-full bg-justreal-red hover:bg-justreal-red-dark text-white font-semibold py-3"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menganalisis...
                        </>
                      ) : (
                        'Analisis Sekarang'
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="batch" className="space-y-4 mt-4">
                    <FileUpload onDataLoaded={setUploadedData} />
                    
                    {uploadedData.length > 0 && (
                      <div className="bg-justreal-black p-4 rounded border border-justreal-gray">
                        <p className="text-justreal-white mb-2">
                          <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                          Data dimuat: {uploadedData.length} komentar
                        </p>
                        <Button
                          onClick={handleAnalyzeBatch}
                          disabled={isAnalyzing || !provider || !apiKey}
                          className="w-full bg-justreal-red hover:bg-justreal-red-dark text-white font-semibold py-3"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Menganalisis Batch...
                            </>
                          ) : (
                            'Analisis Batch'
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Results */}
            {result && <AnalysisResults result={result} />}
            {batchResults && <AnalysisResults batchResults={batchResults} />}
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
