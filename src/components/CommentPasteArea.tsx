
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Hash, Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface CommentPasteAreaProps {
  onCommentsChange: (comments: string[]) => void;
  comments: string[];
}

const CommentPasteArea = ({ onCommentsChange, comments }: CommentPasteAreaProps) => {
  const [pasteText, setPasteText] = useState('');

  const parseComments = (text: string): string[] => {
    if (!text.trim()) return [];
    
    // Split by common delimiters: new lines, double new lines, numbered lists, bullet points
    const delimiters = /\n\s*\n|\n\d+\.\s*|\n[-•*]\s*|\n/;
    return text
      .split(delimiters)
      .map(comment => comment.trim())
      .filter(comment => comment.length > 5) // Filter out very short comments
      .map(comment => comment.replace(/^\d+\.\s*|^[-•*]\s*/, '')); // Remove numbering/bullets
  };

  const handlePaste = () => {
    const newComments = parseComments(pasteText);
    const allComments = [...comments, ...newComments];
    onCommentsChange(allComments);
    setPasteText('');
  };

  const handleClear = () => {
    onCommentsChange([]);
    setPasteText('');
  };

  const removeComment = (index: number) => {
    const newComments = comments.filter((_, i) => i !== index);
    onCommentsChange(newComments);
  };

  const estimatedWords = comments.reduce((total, comment) => {
    return total + comment.split(/\s+/).length;
  }, 0);

  return (
    <div className="space-y-4">
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <Copy className="w-5 h-5 text-justreal-red" />
            Paste Komentar Massal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pasteArea" className="text-justreal-white mb-3 block">
              Tempelkan Komentar (Pisahkan dengan enter atau nomor)
            </Label>
            <Textarea
              id="pasteArea"
              placeholder="Tempelkan komentar di sini... Contoh:
1. Komentar pertama
2. Komentar kedua

Atau:
- Komentar dengan bullet
- Komentar lainnya

Atau pisahkan dengan enter kosong"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="bg-justreal-black border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light min-h-[150px] focus:border-justreal-red transition-colors resize-none"
            />
            <p className="text-xs text-justreal-gray-light mt-2">
              {pasteText.length} karakter • Estimasi {parseComments(pasteText).length} komentar
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePaste}
              disabled={!pasteText.trim()}
              className="bg-justreal-red hover:bg-justreal-red-dark text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Tambahkan Komentar
            </Button>
            
            {comments.length > 0 && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-red hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Semua
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {comments.length > 0 && (
        <Card className="bg-justreal-dark border-justreal-gray card-glow">
          <CardHeader>
            <CardTitle className="text-justreal-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-justreal-red" />
                Komentar Siap Analisis
              </div>
              <div className="flex gap-2">
                <Badge className="bg-justreal-red text-white">
                  {comments.length} komentar
                </Badge>
                <Badge variant="outline" className="border-justreal-red text-justreal-red">
                  <Zap className="w-3 h-3 mr-1" />
                  ~{estimatedWords} kata
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-justreal-black p-3 rounded border border-justreal-gray flex justify-between items-start gap-3 hover:border-justreal-red transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-xs text-justreal-gray-light mb-1">
                      Komentar #{index + 1}
                    </div>
                    <p className="text-justreal-white text-sm">
                      {comment.substring(0, 150)}{comment.length > 150 && '...'}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeComment(index)}
                    size="sm"
                    variant="ghost"
                    className="text-justreal-gray-light hover:text-justreal-red hover:bg-justreal-red/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentPasteArea;
