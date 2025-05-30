
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Instagram, Github, Coffee } from 'lucide-react';

const Credits = () => {
  return (
    <Card className="bg-justreal-dark border-justreal-gray card-glow">
      <CardHeader>
        <CardTitle className="text-justreal-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-justreal-red" />
          Credits & Acknowledgments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <div className="bg-justreal-black p-6 rounded-lg border border-justreal-gray">
            <h3 className="text-xl font-bold text-justreal-white mb-2">
              Made with ❤️ by Ardelyo
            </h3>
            <p className="text-justreal-gray-light mb-4">
              AI-Powered Comment Analysis System
            </p>
            
            <div className="flex justify-center gap-3 mb-4">
              <Badge className="bg-justreal-red text-white flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                Creator
              </Badge>
              <Badge variant="outline" className="border-justreal-red text-justreal-red">
                Full Stack Developer
              </Badge>
            </div>
            
            <div className="space-y-2">
              <a
                href="https://github.com/ardelyo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-justreal-gray-light hover:text-justreal-red transition-colors"
              >
                <Github className="w-4 h-4" />
                @ardelyo
              </a>
            </div>
          </div>

          <div className="bg-justreal-black p-6 rounded-lg border border-justreal-gray">
            <h4 className="text-lg font-semibold text-justreal-white mb-2">
              Inspired by @Mostchreal
            </h4>
            <p className="text-justreal-gray-light mb-3">
              Content Creator & Digital Innovation Enthusiast
            </p>
            
            <a
              href="https://instagram.com/mostchreal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-justreal-gray-light hover:text-justreal-red transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @mostchreal on Instagram
            </a>
          </div>
        </div>

        <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
          <h4 className="text-justreal-white font-semibold mb-2">Teknologi yang Digunakan:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light">
              React + TypeScript
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light">
              Tailwind CSS
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light">
              Recharts
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light">
              OpenAI API
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light">
              Gemini API
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light">
              HuggingFace
            </Badge>
          </div>
        </div>

        <div className="text-center text-sm text-justreal-gray-light">
          <p>© 2024 JustReal AI. Built for digital wellness and content moderation.</p>
          <p className="mt-1">Helping create safer online communities through AI.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Credits;
