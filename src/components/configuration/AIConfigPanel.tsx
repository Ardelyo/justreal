
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import { Provider } from '@/types/analysis';

interface AIConfigPanelProps {
  provider: string;
  setProvider: (provider: string) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  model: string;
  setModel: (model: string) => void;
  customModel: string;
  setCustomModel: (customModel: string) => void;
  providers: Provider[];
}

const AIConfigPanel = ({
  provider,
  setProvider,
  apiKey,
  setApiKey,
  model,
  setModel,
  customModel,
  setCustomModel,
  providers
}: AIConfigPanelProps) => {
  return (
    <Card className="bg-justreal-dark border-justreal-gray card-glow">
      <CardHeader>
        <CardTitle className="text-justreal-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-justreal-red" />
          Konfigurasi AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="provider" className="text-justreal-white mb-2 block">Penyedia LLM</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white hover:border-justreal-red transition-colors">
              <SelectValue placeholder="Pilih penyedia AI..." />
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
          <Label htmlFor="apikey" className="text-justreal-white mb-2 block">API Key</Label>
          <Input
            id="apikey"
            type="password"
            placeholder="Masukkan API key Anda..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light focus:border-justreal-red transition-colors"
          />
        </div>

        {provider && (
          <div>
            <Label htmlFor="model" className="text-justreal-white mb-2 block">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white hover:border-justreal-red transition-colors">
                <SelectValue placeholder="Pilih model..." />
              </SelectTrigger>
              <SelectContent className="bg-justreal-dark border-justreal-gray">
                {providers.find(p => p.value === provider)?.models.map((m) => (
                  <SelectItem key={m} value={m} className="text-justreal-white focus:bg-justreal-red">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="customModel" className="text-justreal-white mb-2 block">Model Kustom</Label>
          <Input
            id="customModel"
            placeholder="Model kustom..."
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light focus:border-justreal-red transition-colors"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConfigPanel;
