
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Shield, Target, Zap, Hash } from 'lucide-react';

const Header = () => {
  return (
    <div className="text-center mb-12 animate-fade-in">
      <div className="flex justify-center items-center mb-4">
        <Sparkles className="w-8 h-8 text-justreal-red mr-3 animate-pulse" />
        <h1 className="text-6xl font-bold">
          <span className="gradient-text">JustReal v2.0</span>
        </h1>
        <Sparkles className="w-8 h-8 text-justreal-red ml-3 animate-pulse" />
      </div>
      <p className="text-xl text-justreal-gray-light mb-2">
        Analisis Komentar AI Enhanced dengan NLP Canggih
      </p>
      <p className="text-justreal-gray-light mb-6">
        Sistem Analisis Komentar Cerdas dengan Deteksi Sentimen Multi-Dimensional
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-all duration-300 animate-scale-in">
          <Brain className="w-4 h-4 mr-2" />
          AI Enhanced v2.0
        </Badge>
        <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-all duration-300 animate-scale-in">
          <Shield className="w-4 h-4 mr-2" />
          Analisis Multi-Sentimen
        </Badge>
        <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-all duration-300 animate-scale-in">
          <Target className="w-4 h-4 mr-2" />
          Deteksi Level Kata
        </Badge>
        <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-all duration-300 animate-scale-in">
          <Zap className="w-4 h-4 mr-2" />
          Mode Efisiensi
        </Badge>
        <Badge variant="outline" className="bg-justreal-dark border-justreal-red text-justreal-white hover:bg-justreal-red transition-all duration-300 animate-scale-in">
          <Hash className="w-4 h-4 mr-2" />
          Pemrosesan Batch
        </Badge>
      </div>
    </div>
  );
};

export default Header;
