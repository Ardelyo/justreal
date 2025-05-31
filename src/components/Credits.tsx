
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Globe, Github, Coffee, Users } from 'lucide-react';

const Credits = () => {
  return (
    <Card className="bg-justreal-dark border-justreal-gray card-glow hover:card-glow-intense transition-all duration-500">
      <CardHeader>
        <CardTitle className="text-justreal-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-justreal-red animate-pulse" />
          Kredit & Kolaborasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <div className="bg-justreal-black p-6 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300 animate-fade-in">
            <h3 className="text-xl font-bold text-justreal-white mb-2">
              Dibuat dengan ❤️ oleh Ardelyo
            </h3>
            <p className="text-justreal-gray-light mb-4">
              Sistem Analisis Komentar Bertenaga AI
            </p>
            
            <div className="flex justify-center gap-3 mb-4">
              <Badge className="bg-justreal-red text-white flex items-center gap-1 hover:bg-justreal-red-dark transition-colors">
                <Coffee className="w-3 h-3" />
                Pengembang
              </Badge>
              <Badge variant="outline" className="border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white transition-colors">
                Full Stack Developer
              </Badge>
            </div>
            
            <div className="space-y-2">
              <a
                href="https://github.com/ardelyo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-justreal-gray-light hover:text-justreal-red transition-colors hover:scale-105 transform duration-200"
              >
                <Github className="w-4 h-4" />
                @ardelyo
              </a>
            </div>
          </div>

          <div className="bg-justreal-black p-6 rounded-lg border border-justreal-gray hover:border-justreal-red transition-all duration-300 animate-fade-in">
            <h4 className="text-lg font-semibold text-justreal-white mb-2">
              Kolaborasi bersama nosensor.id
            </h4>
            <p className="text-justreal-gray-light mb-3">
              Platform Jurnalisme Independen & Inovasi Digital
            </p>
            
            <div className="flex justify-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center gap-1">
                <Users className="w-3 h-3" />
                Partner Kolaborasi
              </Badge>
            </div>
            
            <a
              href="https://nosensor.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-justreal-gray-light hover:text-justreal-red transition-colors hover:scale-105 transform duration-200"
            >
              <Globe className="w-4 h-4" />
              nosensor.id
            </a>
          </div>
        </div>

        <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray animate-fade-in">
          <h4 className="text-justreal-white font-semibold mb-2">Teknologi yang Digunakan:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light hover:border-justreal-red transition-colors">
              React + TypeScript
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light hover:border-justreal-red transition-colors">
              Tailwind CSS
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light hover:border-justreal-red transition-colors">
              Recharts
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light hover:border-justreal-red transition-colors">
              OpenAI API
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light hover:border-justreal-red transition-colors">
              Gemini API
            </Badge>
            <Badge variant="outline" className="border-justreal-gray text-justreal-gray-light hover:border-justreal-red transition-colors">
              Machine Learning NLP
            </Badge>
          </div>
        </div>

        <div className="text-center text-sm text-justreal-gray-light animate-fade-in">
          <p>© 2024 JustReal AI. Dibangun untuk kesehatan digital dan moderasi konten.</p>
          <p className="mt-1">Membantu menciptakan komunitas online yang lebih aman melalui AI.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Credits;
