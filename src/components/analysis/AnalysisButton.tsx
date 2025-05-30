
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Brain, Target } from 'lucide-react';

interface AnalysisButtonProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
  provider: string;
  apiKey: string;
  commentCount: number;
  processedCount: number;
}

const AnalysisButton = ({
  onAnalyze,
  isAnalyzing,
  provider,
  apiKey,
  commentCount,
  processedCount
}: AnalysisButtonProps) => {
  return (
    <Card className="bg-justreal-dark border-justreal-gray card-glow">
      <CardHeader>
        <CardTitle className="text-justreal-white flex items-center gap-2">
          <Target className="w-5 h-5 text-justreal-red" />
          Mulai Analisis Enhanced REAL v2.0
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing || !provider || !apiKey}
          className="w-full bg-justreal-red hover:bg-justreal-red-dark text-white font-semibold py-4 text-lg transition-all duration-300 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Menganalisis... ({processedCount}/{commentCount})
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Analisis {commentCount} Komentar dengan AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalysisButton;
