
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAIStore } from '@/stores/aiStore';
import { multiModelAI } from '@/services/multiModelAI';

const ModelSelector = () => {
  const {
    selectedModel,
    modelSettings,
    setSelectedModel,
    updateModelSettings,
    getAccuracyMetrics
  } = useAIStore();

  const providers = multiModelAI.getAvailableProviders();
  const currentProvider = selectedModel.includes('gpt') ? 'openai' : 
                         selectedModel.includes('gemini') ? 'gemini' : 
                         selectedModel.includes('claude') ? 'claude' : 'openai';
  
  const availableModels = multiModelAI.getModelsForProvider(currentProvider);
  const accuracy = getAccuracyMetrics();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-justreal-dark to-justreal-black border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-justreal-red" />
            AI Model & Pengaturan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-justreal-white">Penyedia AI</Label>
            <div className="grid grid-cols-3 gap-2">
              {providers.map((provider) => (
                <motion.button
                  key={provider}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const firstModel = multiModelAI.getModelsForProvider(provider)[0];
                    setSelectedModel(firstModel);
                  }}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    currentProvider === provider
                      ? 'border-justreal-red bg-justreal-red/20 text-justreal-white'
                      : 'border-justreal-gray bg-justreal-dark text-justreal-gray-light hover:border-justreal-red'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {provider === 'openai' ? 'OpenAI' : 
                     provider === 'gemini' ? 'Gemini' : 
                     provider === 'claude' ? 'Claude' : provider}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="text-justreal-white">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white">
                <SelectValue placeholder="Pilih model AI" />
              </SelectTrigger>
              <SelectContent className="bg-justreal-black border-justreal-gray">
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model} className="text-justreal-white hover:bg-justreal-gray">
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-justreal-red" />
              <Label className="text-justreal-white">Pengaturan Model</Label>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-justreal-gray-light text-sm">
                  Temperature: {modelSettings.temperature}
                </Label>
                <Slider
                  value={[modelSettings.temperature]}
                  onValueChange={(value) => updateModelSettings({ temperature: value[0] })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-justreal-gray-light text-sm">
                  Max Tokens: {modelSettings.maxTokens}
                </Label>
                <Slider
                  value={[modelSettings.maxTokens]}
                  onValueChange={(value) => updateModelSettings({ maxTokens: value[0] })}
                  max={4000}
                  min={500}
                  step={100}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-justreal-gray-light text-sm">
                  Top P: {modelSettings.topP}
                </Label>
                <Slider
                  value={[modelSettings.topP]}
                  onValueChange={(value) => updateModelSettings({ topP: value[0] })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Accuracy Metrics */}
          <div className="pt-4 border-t border-justreal-gray">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-justreal-red" />
              <Label className="text-justreal-white">Metrik Akurasi</Label>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-justreal-red text-xl font-bold">
                  {accuracy.accuracy.toFixed(1)}%
                </div>
                <div className="text-justreal-gray-light text-xs">Akurasi</div>
              </div>
              <div className="text-center">
                <div className="text-justreal-white text-xl font-bold">
                  {accuracy.correct}
                </div>
                <div className="text-justreal-gray-light text-xs">Benar</div>
              </div>
              <div className="text-center">
                <div className="text-justreal-gray-light text-xl font-bold">
                  {accuracy.total}
                </div>
                <div className="text-justreal-gray-light text-xs">Total</div>
              </div>
            </div>
          </div>

          {/* Performance Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-justreal-red/20 text-justreal-red border-justreal-red">
              <Zap className="w-3 h-3 mr-1" />
              TensorFlow.js
            </Badge>
            <Badge className="bg-justreal-red/20 text-justreal-red border-justreal-red">
              <Brain className="w-3 h-3 mr-1" />
              Multi-Model
            </Badge>
            <Badge className="bg-justreal-red/20 text-justreal-red border-justreal-red">
              <Target className="w-3 h-3 mr-1" />
              Real-time Learning
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModelSelector;
