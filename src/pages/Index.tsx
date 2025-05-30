
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Shield, Brain, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AnalysisResults from '@/components/AnalysisResults';
import AboutSection from '@/components/AboutSection';

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

const Index = () => {
  const [provider, setProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const providers = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o'] },
    { value: 'gemini', label: 'Google Gemini', models: ['gemini-1.5-flash', 'gemini-1.5-pro'] },
    { value: 'openrouter', label: 'OpenRouter', models: ['meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free'] }
  ];

  const getCurrentModels = () => {
    const currentProvider = providers.find(p => p.value === provider);
    return currentProvider ? currentProvider.models : [];
  };

  const handleAnalyze = async () => {
    if (!provider || !apiKey || !comment.trim()) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API call with mock data for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: AnalysisResult = {
        original_comment: comment,
        klasifikasi: ["SDM_RENDAH"],
        skor_kepercayaan: {
          UJARAN_KEBENCIAN: 0.1,
          BUZZER: 0.2,
          SDM_RENDAH: 0.8,
          NETRAL_POSITIF: 0.3
        },
        penjelasan_singkat: "Komentar mengandung bahasa kasar dan tidak konstruktif, termasuk kategori SDM rendah."
      };

      setResult(mockResult);
      toast({
        title: "Analisis Selesai",
        description: "Komentar berhasil dianalisis menggunakan sistem REAL"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menganalisis komentar",
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-justreal-dark border-justreal-gray card-glow">
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
                    <Label htmlFor="model" className="text-justreal-white">Model (Opsional)</Label>
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
              <CardContent className="space-y-4">
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
                  onClick={handleAnalyze}
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
              </CardContent>
            </Card>

            {/* Results */}
            {result && <AnalysisResults result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
