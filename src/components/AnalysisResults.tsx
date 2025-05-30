
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, Eye } from 'lucide-react';

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

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UJARAN_KEBENCIAN':
        return 'bg-red-600 text-white';
      case 'BUZZER':
        return 'bg-orange-600 text-white';
      case 'SDM_RENDAH':
        return 'bg-yellow-600 text-white';
      case 'NETRAL_POSITIF':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'UJARAN_KEBENCIAN':
        return <XCircle className="w-4 h-4" />;
      case 'BUZZER':
        return <AlertTriangle className="w-4 h-4" />;
      case 'SDM_RENDAH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'NETRAL_POSITIF':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-500';
    if (score >= 0.5) return 'bg-orange-500';
    if (score >= 0.3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Classification */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-justreal-red" />
            Hasil Analisis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-justreal-white font-semibold mb-2">Komentar Asli:</h3>
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
              <p className="text-justreal-gray-light italic">"{result.original_comment}"</p>
            </div>
          </div>

          <div>
            <h3 className="text-justreal-white font-semibold mb-2">Klasifikasi:</h3>
            <div className="flex flex-wrap gap-2">
              {result.klasifikasi.map((category, index) => (
                <Badge key={index} className={`${getCategoryColor(category)} flex items-center gap-1`}>
                  {getCategoryIcon(category)}
                  {category.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-justreal-white font-semibold mb-2">Penjelasan:</h3>
            <p className="text-justreal-gray-light bg-justreal-black p-3 rounded-lg border border-justreal-gray">
              {result.penjelasan_singkat}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Scores */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white">Skor Kepercayaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(result.skor_kepercayaan).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-justreal-white font-medium">
                  {category.replace('_', ' ')}
                </span>
                <span className="text-justreal-gray-light">
                  {(score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={score * 100} 
                  className="h-2 bg-justreal-black"
                />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
