
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AnalysisResult } from '@/types/analysis';
import { providers } from '@/utils/aiProviders';
import { analyzeComments } from '@/utils/apiAnalysis';

// Layout Components
import Header from '@/components/layout/Header';

// Configuration Components
import AIConfigPanel from '@/components/configuration/AIConfigPanel';

// Analysis Components
import AnalysisButton from '@/components/analysis/AnalysisButton';

// Feature Components
import DataVisualization from '@/components/DataVisualization';
import CommentPasteArea from '@/components/CommentPasteArea';
import WordAnalysis from '@/components/WordAnalysis';
import EfficiencyMode from '@/components/EfficiencyMode';
import Credits from '@/components/Credits';
import TransparencyModal from '@/components/TransparencyModal';

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
          const batchResults = await analyzeComments(batch, provider, apiKey, model, customModel, efficiencyMode);
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
          const result = await analyzeComments([comments[i]], provider, apiKey, model, customModel, efficiencyMode);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-justreal-black via-justreal-dark to-justreal-black">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <AIConfigPanel
              provider={provider}
              setProvider={setProvider}
              apiKey={apiKey}
              setApiKey={setApiKey}
              model={model}
              setModel={setModel}
              customModel={customModel}
              setCustomModel={setCustomModel}
              providers={providers}
            />

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
              <AnalysisButton
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                provider={provider}
                apiKey={apiKey}
                commentCount={comments.length}
                processedCount={processedCount}
              />
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
