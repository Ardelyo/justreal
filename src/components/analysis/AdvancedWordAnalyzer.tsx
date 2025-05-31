
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Heart, Hash, Zap } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

interface AdvancedWordAnalyzerProps {
  analysisResults: AnalysisResult[];
}

interface WordFeature {
  word: string;
  sentiment: 'POSITIF' | 'NEGATIF' | 'NETRAL' | 'UJARAN_KEBENCIAN' | 'VULGAR';
  confidence: number;
  frequency: number;
  toxicity: number;
  context: string[];
  emotionalWeight: number;
}

interface NLPInsight {
  totalWords: number;
  uniqueWords: number;
  averageSentiment: number;
  toxicityLevel: number;
  emotionalIntensity: number;
  linguisticComplexity: number;
}

const AdvancedWordAnalyzer = ({ analysisResults }: AdvancedWordAnalyzerProps) => {
  
  const { wordFeatures, nlpInsights } = useMemo(() => {
    // Enhanced word dictionaries dengan bobot emosional
    const positiveWords = new Map([
      ['bagus', 0.8], ['baik', 0.7], ['hebat', 0.9], ['keren', 0.8], ['mantap', 0.8],
      ['oke', 0.6], ['setuju', 0.7], ['benar', 0.7], ['tepat', 0.7], ['indah', 0.8],
      ['cantik', 0.8], ['pintar', 0.8], ['cerdas', 0.9], ['sukses', 0.9], ['berhasil', 0.9],
      ['senang', 0.8], ['gembira', 0.9], ['terima kasih', 0.9], ['makasih', 0.7],
      ['appreciate', 0.8], ['respect', 0.8], ['hormat', 0.8], ['salut', 0.8]
    ]);
    
    const negativeWords = new Map([
      ['buruk', 0.8], ['jelek', 0.7], ['bodoh', 0.9], ['tolol', 0.9], ['goblok', 0.9],
      ['bego', 0.8], ['salah', 0.6], ['gagal', 0.8], ['rusak', 0.7], ['hancur', 0.9],
      ['sedih', 0.7], ['kecewa', 0.8], ['marah', 0.8], ['kesal', 0.7], ['benci', 0.9], ['muak', 0.8]
    ]);
    
    const hateWords = new Map([
      ['anjing', 0.95], ['babi', 0.95], ['bangsat', 0.95], ['bajingan', 0.95], ['keparat', 0.95],
      ['sialan', 0.9], ['kampret', 0.9], ['tai', 0.85], ['setan', 0.9], ['iblis', 0.9],
      ['kafir', 0.95], ['murtad', 0.95], ['komunis', 0.9], ['pki', 0.9], ['aseng', 0.95],
      ['cina', 0.8], ['pribumi', 0.7], ['non-pribumi', 0.7], ['mayoritas', 0.6], ['minoritas', 0.6]
    ]);
    
    const vulgarWords = new Map([
      ['kontol', 0.95], ['memek', 0.95], ['pepek', 0.95], ['ngentot', 0.95], ['entot', 0.95],
      ['colmek', 0.9], ['coli', 0.9], ['titit', 0.8], ['toket', 0.8], ['nenen', 0.7],
      ['jembut', 0.85], ['pelacur', 0.9], ['sundel', 0.9], ['bobok', 0.8]
    ]);

    const wordMap = new Map<string, WordFeature>();
    let totalWords = 0;
    let totalSentimentScore = 0;
    let totalToxicity = 0;

    analysisResults.forEach((result, commentIndex) => {
      const words = result.original_comment.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((word: string) => word.length > 2);

      totalWords += words.length;

      words.forEach((word: string) => {
        let sentiment: WordFeature['sentiment'] = 'NETRAL';
        let confidence = 0.5;
        let emotionalWeight = 0.5;
        let toxicity = 0.1;

        // Advanced ML-like classification
        if (hateWords.has(word)) {
          sentiment = 'UJARAN_KEBENCIAN';
          confidence = hateWords.get(word) || 0.9;
          emotionalWeight = 0.95;
          toxicity = 0.9;
        } else if (vulgarWords.has(word)) {
          sentiment = 'VULGAR';
          confidence = vulgarWords.get(word) || 0.85;
          emotionalWeight = 0.8;
          toxicity = 0.7;
        } else if (negativeWords.has(word)) {
          sentiment = 'NEGATIF';
          confidence = negativeWords.get(word) || 0.7;
          emotionalWeight = 0.7;
          toxicity = 0.4;
        } else if (positiveWords.has(word)) {
          sentiment = 'POSITIF';
          confidence = positiveWords.get(word) || 0.75;
          emotionalWeight = 0.8;
          toxicity = 0.1;
        }

        // Contextual analysis (simple implementation)
        const contextWords = words.slice(Math.max(0, words.indexOf(word) - 2), words.indexOf(word) + 3);
        const hasNegation = contextWords.some(w => ['tidak', 'bukan', 'jangan', 'tanpa'].includes(w));
        if (hasNegation && sentiment === 'POSITIF') {
          sentiment = 'NEGATIF';
          confidence *= 0.8;
        }

        totalSentimentScore += sentiment === 'POSITIF' ? confidence : sentiment === 'NEGATIF' ? -confidence : 0;
        totalToxicity += toxicity;

        if (confidence > 0.6) {
          const existing = wordMap.get(word);
          if (existing) {
            existing.frequency++;
            existing.confidence = Math.max(existing.confidence, confidence);
            existing.context.push(`Komentar #${commentIndex + 1}`);
          } else {
            wordMap.set(word, {
              word,
              sentiment,
              confidence,
              frequency: 1,
              toxicity,
              context: [`Komentar #${commentIndex + 1}`],
              emotionalWeight
            });
          }
        }
      });
    });

    const wordFeatures = Array.from(wordMap.values())
      .sort((a, b) => (b.confidence * b.frequency) - (a.confidence * a.frequency))
      .slice(0, 30);

    const nlpInsights: NLPInsight = {
      totalWords,
      uniqueWords: wordMap.size,
      averageSentiment: totalWords > 0 ? totalSentimentScore / totalWords : 0,
      toxicityLevel: totalWords > 0 ? totalToxicity / totalWords : 0,
      emotionalIntensity: wordFeatures.reduce((sum, w) => sum + w.emotionalWeight, 0) / wordFeatures.length || 0,
      linguisticComplexity: wordFeatures.length / totalWords || 0
    };

    return { wordFeatures, nlpInsights };
  }, [analysisResults]);

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      'POSITIF': '#16a34a',
      'NEGATIF': '#dc2626',
      'UJARAN_KEBENCIAN': '#7c2d12',
      'VULGAR': '#9333ea',
      'NETRAL': '#6b7280'
    };
    return colors[sentiment as keyof typeof colors] || '#6b7280';
  };

  const getSentimentIcon = (sentiment: string) => {
    const icons = {
      'POSITIF': <Heart className="w-4 h-4" />,
      'NEGATIF': <AlertTriangle className="w-4 h-4" />,
      'UJARAN_KEBENCIAN': <Brain className="w-4 h-4" />,
      'VULGAR': <Zap className="w-4 h-4" />,
      'NETRAL': <Hash className="w-4 h-4" />
    };
    return icons[sentiment as keyof typeof icons] || <Hash className="w-4 h-4" />;
  };

  if (wordFeatures.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* NLP Insights Dashboard */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-justreal-red animate-pulse" />
            Dashboard Insight NLP Canggih
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-justreal-white">{nlpInsights.totalWords}</div>
                <div className="text-justreal-gray-light text-sm">Total Kata</div>
              </div>
            </div>
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-justreal-white">{nlpInsights.uniqueWords}</div>
                <div className="text-justreal-gray-light text-sm">Kata Unik</div>
              </div>
            </div>
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-justreal-white">
                  {(nlpInsights.averageSentiment * 100).toFixed(1)}%
                </div>
                <div className="text-justreal-gray-light text-sm">Skor Sentimen</div>
              </div>
            </div>
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-justreal-white">
                  {(nlpInsights.toxicityLevel * 100).toFixed(1)}%
                </div>
                <div className="text-justreal-gray-light text-sm">Level Toksisitas</div>
              </div>
            </div>
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-justreal-white">
                  {(nlpInsights.emotionalIntensity * 100).toFixed(1)}%
                </div>
                <div className="text-justreal-gray-light text-sm">Intensitas Emosi</div>
              </div>
            </div>
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-justreal-white">
                  {(nlpInsights.linguisticComplexity * 100).toFixed(1)}%
                </div>
                <div className="text-justreal-gray-light text-sm">Kompleksitas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Word Analysis */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-justreal-red" />
            Analisis Kata Tingkat Lanjut (Machine Learning)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {wordFeatures.map((wordData, index) => (
              <div
                key={`${wordData.word}-${index}`}
                className="bg-justreal-black p-4 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300 hover:scale-105 transform"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-justreal-white font-mono font-bold text-lg">
                    "{wordData.word}"
                  </span>
                  <Badge
                    style={{ backgroundColor: getSentimentColor(wordData.sentiment), color: 'white' }}
                    className="flex items-center gap-1 text-xs animate-pulse"
                  >
                    {getSentimentIcon(wordData.sentiment)}
                    {wordData.sentiment}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-justreal-gray-light text-xs">Kepercayaan:</span>
                    <span className="text-justreal-red font-semibold">
                      {(wordData.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-justreal-gray-light text-xs">Frekuensi:</span>
                    <span className="text-justreal-white font-semibold">
                      {wordData.frequency}x
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-justreal-gray-light text-xs">Toksisitas:</span>
                    <span className="text-orange-400 font-semibold">
                      {(wordData.toxicity * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-justreal-gray-light text-xs">Bobot Emosi:</span>
                    <span className="text-purple-400 font-semibold">
                      {(wordData.emotionalWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="text-xs text-justreal-gray-light mt-2">
                    Konteks: {wordData.context.slice(0, 2).join(', ')}
                    {wordData.context.length > 2 && ` +${wordData.context.length - 2} lainnya`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedWordAnalyzer;
