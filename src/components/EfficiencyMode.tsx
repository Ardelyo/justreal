
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, DollarSign, Clock, Cpu } from 'lucide-react';

interface EfficiencyModeProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  commentCount: number;
}

const EfficiencyMode = ({ enabled, onToggle, commentCount }: EfficiencyModeProps) => {
  const calculateSavings = () => {
    if (commentCount <= 1) return { calls: 1, tokens: 500, cost: 0.01 };
    
    const normalCalls = commentCount;
    const efficientCalls = Math.ceil(commentCount / 10); // Batch 10 comments per call
    
    const normalTokens = commentCount * 500; // ~500 tokens per comment
    const efficientTokens = efficientCalls * 2000; // ~2000 tokens per batch
    
    const savings = {
      calls: enabled ? efficientCalls : normalCalls,
      callsSaved: normalCalls - efficientCalls,
      tokens: enabled ? efficientTokens : normalTokens,
      tokensSaved: normalTokens - efficientTokens,
      cost: enabled ? efficientTokens * 0.00001 : normalTokens * 0.00001,
      costSaved: (normalTokens - efficientTokens) * 0.00001
    };
    
    return savings;
  };

  const savings = calculateSavings();

  return (
    <Card className="bg-justreal-dark border-justreal-gray card-glow">
      <CardHeader>
        <CardTitle className="text-justreal-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-justreal-red" />
          Mode Efisiensi AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="efficiency-mode" className="text-justreal-white font-semibold">
              Aktifkan Mode Efisiensi
            </Label>
            <p className="text-sm text-justreal-gray-light">
              Proses beberapa komentar dalam 1 API call untuk menghemat biaya
            </p>
          </div>
          <Switch
            id="efficiency-mode"
            checked={enabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-justreal-red"
          />
        </div>

        {commentCount > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-justreal-red" />
                <span className="text-justreal-white font-semibold text-sm">API Calls</span>
              </div>
              <div className="text-lg font-bold text-justreal-white">
                {savings.calls}
                {enabled && savings.callsSaved > 0 && (
                  <span className="text-sm text-green-400 ml-2">
                    (-{savings.callsSaved})
                  </span>
                )}
              </div>
              <p className="text-xs text-justreal-gray-light">
                {enabled ? 'Dengan batching' : 'Mode normal'}
              </p>
            </div>

            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-justreal-red" />
                <span className="text-justreal-white font-semibold text-sm">Estimasi Tokens</span>
              </div>
              <div className="text-lg font-bold text-justreal-white">
                {savings.tokens.toLocaleString()}
                {enabled && savings.tokensSaved > 0 && (
                  <span className="text-sm text-green-400 ml-2">
                    (-{savings.tokensSaved.toLocaleString()})
                  </span>
                )}
              </div>
              <p className="text-xs text-justreal-gray-light">
                Total penggunaan
              </p>
            </div>

            <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-justreal-red" />
                <span className="text-justreal-white font-semibold text-sm">Perkiraan Biaya</span>
              </div>
              <div className="text-lg font-bold text-justreal-white">
                ${savings.cost.toFixed(4)}
                {enabled && savings.costSaved > 0 && (
                  <span className="text-sm text-green-400 ml-2">
                    (-${savings.costSaved.toFixed(4)})
                  </span>
                )}
              </div>
              <p className="text-xs text-justreal-gray-light">
                Estimasi OpenAI pricing
              </p>
            </div>
          </div>
        )}

        <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
          <h4 className="text-justreal-white font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Cara Kerja Mode Efisiensi:
          </h4>
          <div className="text-justreal-gray-light text-sm space-y-1">
            <p>• Menggabungkan hingga 10 komentar per API call</p>
            <p>• Menggunakan system prompt yang dioptimasi untuk batch processing</p>
            <p>• Mempertahankan akurasi dengan konteks yang lebih kaya</p>
            <p>• Mengurangi latency dengan parallel processing</p>
            {enabled ? (
              <Badge className="bg-green-600 text-white mt-2">
                <Zap className="w-3 h-3 mr-1" />
                Mode Efisiensi Aktif
              </Badge>
            ) : (
              <Badge variant="outline" className="border-justreal-red text-justreal-red mt-2">
                Mode Normal Aktif
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EfficiencyMode;
