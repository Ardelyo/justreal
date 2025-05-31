
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AnalysisResult } from '@/types/analysis';
import { providers } from '@/utils/aiProviders';
import { analyzeComments } from '@/utils/apiAnalysis';
import { multiModelAI } from '@/services/multiModelAI';
import { tensorflowService } from '@/services/tensorflowService';
import ModelSelector from '@/components/ai/ModelSelector';
import D3SentimentChart from '@/components/visualization/D3SentimentChart';

// Import motion with fallback
let motion: any;
let AnimatePresence: any;

try {
  const framerMotion = require('framer-motion');
  motion = framerMotion.motion;
  AnimatePresence = framerMotion.AnimatePresence;
} catch {
  // Fallback if framer-motion is not available
  motion = {
    div: ({ children, className, ...props }: any) => <div className={className}>{children}</div>
  };
  AnimatePresence = ({ children }: any) => <>{children}</>;
}

// Layout Components
import Header from '@/components/layout/Header';

// Configuration Components
import AIConfigPanel from '@/components/configuration/AIConfigPanel';

// Analysis Components
import AnalysisButton from '@/components/analysis/AnalysisButton';
import AdvancedWordAnalyzer from '@/components/analysis/AdvancedWordAnalyzer';

// Feature Components
import DataVisualization from '@/components/DataVisualization';
import CommentPasteArea from '@/components/CommentPasteArea';
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
        title: "Kesalahan",
        description: "Mohon lengkapi penyedia AI, API key, dan tambahkan komentar untuk dianalisis",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResults([]);
    setProcessedCount(0);
    
    try {
      // Initialize TensorFlow.js service
      await tensorflowService.initialize();
      
      toast({
        title: "Memulai Analisis Enhanced",
        description: "Menggunakan AI multi-model dengan TensorFlow.js untuk analisis mendalam",
        duration: 3000
      });

      // Use the new multi-model AI service with correct arguments
      const analysisResults = await multiModelAI.analyzeComments(
        comments,
        provider,
        apiKey,
        customModel.trim() || model,
        efficiencyMode
      );

      setResults(analysisResults);
      setProcessedCount(analysisResults.length);
      
      toast({
        title: "Analisis Selesai",
        description: `${comments.length} komentar berhasil dianalisis menggunakan sistem REAL v3.0 dengan TensorFlow.js`,
        duration: 5000
      });
    } catch (error) {
      console.error('Enhanced analysis error:', error);
      toast({
        title: "Kesalahan",
        description: `Terjadi kesalahan saat menganalisis: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-justreal-black via-justreal-dark to-justreal-black"
    >
      <div className="container mx-auto px-4 py-8">
        <Header />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <ModelSelector />

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

          {/* Enhanced Main Analysis Panel */}
          <div className="lg:col-span-3 space-y-6">
            <CommentPasteArea 
              comments={comments}
              onCommentsChange={setComments}
            />

            <AnimatePresence>
              {comments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnalysisButton
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    provider={provider}
                    apiKey={apiKey}
                    commentCount={comments.length}
                    processedCount={processedCount}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Results with D3.js Visualization */}
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Tabs defaultValue="d3-charts" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-justreal-black mb-6">
                      <TabsTrigger 
                        value="d3-charts" 
                        className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                      >
                        D3.js Charts
                      </TabsTrigger>
                      <TabsTrigger 
                        value="visualization" 
                        className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                      >
                        Visualisasi Data
                      </TabsTrigger>
                      <TabsTrigger 
                        value="words" 
                        className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                      >
                        Analisis Kata
                      </TabsTrigger>
                      <TabsTrigger 
                        value="table" 
                        className="data-[state=active]:bg-justreal-red data-[state=active]:text-white transition-all duration-300"
                      >
                        Tabel Detail
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="d3-charts" className="mt-4">
                      <D3SentimentChart results={results} />
                    </TabsContent>
                    
                    <TabsContent value="visualization" className="mt-4">
                      <DataVisualization results={results} />
                    </TabsContent>
                    
                    <TabsContent value="words" className="mt-4">
                      <AdvancedWordAnalyzer analysisResults={results} />
                    </TabsContent>
                    
                    <TabsContent value="table" className="mt-4">
                      <DataVisualization results={results} />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <TransparencyModal 
        open={showTransparency} 
        onOpenChange={setShowTransparency} 
      />
    </motion.div>
  );
};

export default Index;
