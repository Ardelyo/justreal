
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Eye, AlertTriangle, Heart, Hash } from 'lucide-react';

interface WordAnalysisProps {
  analysisResults: any[];
}

interface WordSentiment {
  word: string;
  sentiment: 'POSITIF' | 'NEGATIF' | 'NETRAL' | 'UJARAN_KEBENCIAN' | 'VULGAR';
  confidence: number;
  context: string;
}

const WordAnalysis = ({ analysisResults }: WordAnalysisProps) => {
  const analyzeWords = (): WordSentiment[] => {
    const allWords: WordSentiment[] = [];
    
    // Enhanced word dictionaries with Indonesian context
    const positiveWords = [
      'bagus', 'baik', 'hebat', 'keren', 'mantap', 'oke', 'setuju', 'benar', 'tepat',
      'indah', 'cantik', 'pintar', 'cerdas', 'sukses', 'berhasil', 'senang', 'gembira',
      'terima kasih', 'makasih', 'appreciate', 'respect', 'hormat', 'salut'
    ];
    
    const negativeWords = [
      'buruk', 'jelek', 'bodoh', 'tolol', 'goblok', 'bego', 'salah', 'gagal',
      'rusak', 'hancur', 'sedih', 'kecewa', 'marah', 'kesal', 'benci', 'muak'
    ];
    
    const hateWords = [
      'anjing', 'babi', 'bangsat', 'bajingan', 'keparat', 'sialan', 'kampret',
      'tai', 'setan', 'iblis', 'kafir', 'murtad', 'komunis', 'pki', 'aseng',
      'cina', 'pribumi', 'non-pribumi', 'mayoritas', 'minoritas'
    ];
    
    const vulgarWords = [
      'kontol', 'memek', 'pepek', 'ngentot', 'entot', 'colmek', 'coli',
      'titit', 'toket', 'nenen', 'jembut', 'pelacur', 'sundel', 'bobok'
    ];

    analysisResults.forEach((result, commentIndex) => {
      const words = result.original_comment.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((word: string) => word.length > 2);

      words.forEach((word: string) => {
        let sentiment: WordSentiment['sentiment'] = 'NETRAL';
        let confidence = 0.5;

        if (hateWords.some(hw => word.includes(hw))) {
          sentiment = 'UJARAN_KEBENCIAN';
          confidence = 0.9;
        } else if (vulgarWords.some(vw => word.includes(vw))) {
          sentiment = 'VULGAR';
          confidence = 0.85;
        } else if (negativeWords.some(nw => word.includes(nw))) {
          sentiment = 'NEGATIF';
          confidence = 0.7;
        } else if (positiveWords.some(pw => word.includes(pw))) {
          sentiment = 'POSITIF';
          confidence = 0.75;
        }

        if (confidence > 0.6) {
          allWords.push({
            word,
            sentiment,
            confidence,
            context: `Komentar #${commentIndex + 1}`
          });
        }
      });
    });

    return allWords;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIF': return '#16a34a';
      case 'NEGATIF': return '#dc2626';
      case 'UJARAN_KEBENCIAN': return '#7c2d12';
      case 'VULGAR': return '#9333ea';
      case 'NETRAL': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIF': return <Heart className="w-4 h-4" />;
      case 'NEGATIF': return <AlertTriangle className="w-4 h-4" />;
      case 'UJARAN_KEBENCIAN': return <Brain className="w-4 h-4" />;
      case 'VULGAR': return <Eye className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const wordAnalysis = analyzeWords();
  const sentimentCounts = wordAnalysis.reduce((acc, word) => {
    acc[word.sentiment] = (acc[word.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWords = wordAnalysis
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20);

  if (wordAnalysis.length === 0) {
    return null;
  }

  return (
    <Card className="bg-justreal-dark border-justreal-gray card-glow">
      <CardHeader>
        <CardTitle className="text-justreal-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-justreal-red" />
          Analisis Kata per Kata (NLP Enhanced)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Sentiment Summary */}
        <div className="mb-6">
          <h4 className="text-justreal-white font-semibold mb-3">Ringkasan Sentimen Kata:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sentimentCounts).map(([sentiment, count]) => (
              <Badge
                key={sentiment}
                style={{ backgroundColor: getSentimentColor(sentiment), color: 'white' }}
                className="flex items-center gap-1"
              >
                {getSentimentIcon(sentiment)}
                {sentiment}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Top Detected Words */}
        <div>
          <h4 className="text-justreal-white font-semibold mb-3">Kata-kata Terdeteksi (Confidence Tinggi):</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {topWords.map((wordData, index) => (
              <div
                key={`${wordData.word}-${index}`}
                className="bg-justreal-black p-3 rounded border border-justreal-gray hover:border-justreal-red transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-justreal-white font-mono font-semibold">
                    "{wordData.word}"
                  </span>
                  <Badge
                    style={{ backgroundColor: getSentimentColor(wordData.sentiment), color: 'white' }}
                    className="flex items-center gap-1 text-xs"
                  >
                    {getSentimentIcon(wordData.sentiment)}
                    {wordData.sentiment}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-justreal-gray-light">{wordData.context}</span>
                  <span className="text-justreal-red font-semibold">
                    {(wordData.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Insight */}
        <div className="mt-6 p-4 bg-justreal-black rounded-lg border border-justreal-gray">
          <h4 className="text-justreal-white font-semibold mb-2">Insight NLP:</h4>
          <div className="text-justreal-gray-light text-sm space-y-1">
            <p>• Total kata teranalisis: <span className="text-justreal-white font-semibold">{wordAnalysis.length}</span></p>
            <p>• Tingkat sentimen negatif: <span className="text-justreal-white font-semibold">
              {((sentimentCounts['NEGATIF'] || 0) / wordAnalysis.length * 100).toFixed(1)}%
            </span></p>
            <p>• Deteksi ujaran kebencian: <span className="text-justreal-white font-semibold">
              {((sentimentCounts['UJARAN_KEBENCIAN'] || 0) / wordAnalysis.length * 100).toFixed(1)}%
            </span></p>
            <p>• Kata positif ditemukan: <span className="text-justreal-white font-semibold">
              {((sentimentCounts['POSITIF'] || 0) / wordAnalysis.length * 100).toFixed(1)}%
            </span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordAnalysis;
