
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Shield, Target, Zap, Hash } from 'lucide-react';

const Header = () => {
  return (
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
  );
};

export default Header;
