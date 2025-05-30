
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, XCircle, Eye, Download, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface AnalysisResult {
  original_comment: string;
  klasifikasi: string[];
  skor_kepercayaan: {
    UJARAN_KEBENCIAN: number;
    BUZZER: number;
    SDM_RENDAH: number;
    NETRAL_POSITIF: number;
  };
  penjelasan_singkat: string;
}

interface BatchResult {
  results: AnalysisResult[];
  total: number;
  processed: number;
}

interface AnalysisResultsProps {
  result?: AnalysisResult;
  batchResults?: BatchResult;
}

const AnalysisResults = ({ result, batchResults }: AnalysisResultsProps) => {
  const [showStats, setShowStats] = useState(true);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UJARAN_KEBENCIAN':
        return 'bg-red-600 text-white';
      case 'BUZZER':
        return 'bg-orange-600 text-white';
      case 'SDM_RENDAH':
        return 'bg-yellow-600 text-white';
      case 'NETRAL_POSITIF':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'UJARAN_KEBENCIAN':
        return <XCircle className="w-4 h-4" />;
      case 'BUZZER':
        return <AlertTriangle className="w-4 h-4" />;
      case 'SDM_RENDAH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'NETRAL_POSITIF':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-500';
    if (score >= 0.5) return 'bg-orange-500';
    if (score >= 0.3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const calculateStats = (results: AnalysisResult[]) => {
    const total = results.length;
    const categoryCount = {
      UJARAN_KEBENCIAN: 0,
      BUZZER: 0,
      SDM_RENDAH: 0,
      NETRAL_POSITIF: 0
    };

    results.forEach(result => {
      result.klasifikasi.forEach(kategori => {
        if (kategori in categoryCount) {
          categoryCount[kategori as keyof typeof categoryCount]++;
        }
      });
    });

    return {
      total,
      categoryCount,
      percentages: {
        UJARAN_KEBENCIAN: (categoryCount.UJARAN_KEBENCIAN / total) * 100,
        BUZZER: (categoryCount.BUZZER / total) * 100,
        SDM_RENDAH: (categoryCount.SDM_RENDAH / total) * 100,
        NETRAL_POSITIF: (categoryCount.NETRAL_POSITIF / total) * 100,
      }
    };
  };

  const downloadCSV = (results: AnalysisResult[]) => {
    const headers = [
      'Komentar Asli',
      'Klasifikasi',
      'Skor Ujaran Kebencian',
      'Skor Buzzer',
      'Skor SDM Rendah',
      'Skor Netral/Positif',
      'Penjelasan'
    ];

    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        `"${result.original_comment.replace(/"/g, '""')}"`,
        `"${result.klasifikasi.join('; ')}"`,
        result.skor_kepercayaan.UJARAN_KEBENCIAN.toFixed(3),
        result.skor_kepercayaan.BUZZER.toFixed(3),
        result.skor_kepercayaan.SDM_RENDAH.toFixed(3),
        result.skor_kepercayaan.NETRAL_POSITIF.toFixed(3),
        `"${result.penjelasan_singkat.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `justreal-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Single result display
  if (result) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="bg-justreal-dark border-justreal-gray card-glow">
          <CardHeader>
            <CardTitle className="text-justreal-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-justreal-red" />
              Hasil Analisis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-justreal-white font-semibold mb-2">Komentar Asli:</h3>
              <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
                <p className="text-justreal-gray-light italic">"{result.original_comment}"</p>
              </div>
            </div>

            <div>
              <h3 className="text-justreal-white font-semibold mb-2">Klasifikasi:</h3>
              <div className="flex flex-wrap gap-2">
                {result.klasifikasi.map((category, index) => (
                  <Badge key={index} className={`${getCategoryColor(category)} flex items-center gap-1`}>
                    {getCategoryIcon(category)}
                    {category.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-justreal-white font-semibold mb-2">Penjelasan:</h3>
              <p className="text-justreal-gray-light bg-justreal-black p-3 rounded-lg border border-justreal-gray">
                {result.penjelasan_singkat}
              </p>
            </div>

            <div>
              <h3 className="text-justreal-white font-semibold mb-4">Skor Kepercayaan:</h3>
              <div className="space-y-4">
                {Object.entries(result.skor_kepercayaan).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-justreal-white font-medium">
                        {category.replace('_', ' ')}
                      </span>
                      <span className="text-justreal-gray-light">
                        {(score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={score * 100} 
                        className="h-2 bg-justreal-black"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Batch results display
  if (batchResults) {
    const stats = calculateStats(batchResults.results);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Progress Card */}
        {batchResults.processed < batchResults.total && (
          <Card className="bg-justreal-dark border-justreal-gray card-glow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-justreal-white font-medium">Memproses Batch...</p>
                  <p className="text-justreal-gray-light text-sm">
                    {batchResults.processed} dari {batchResults.total} komentar
                  </p>
                </div>
                <div className="w-32">
                  <Progress value={(batchResults.processed / batchResults.total) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Card */}
        {showStats && batchResults.results.length > 0 && (
          <Card className="bg-justreal-dark border-justreal-gray card-glow">
            <CardHeader>
              <CardTitle className="text-justreal-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-justreal-red" />
                Ringkasan Statistik
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(batchResults.results)}
                  className="ml-auto border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(stats.percentages).map(([category, percentage]) => (
                  <div key={category} className="text-center">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                      {category.replace('_', ' ')}
                    </div>
                    <p className="text-2xl font-bold text-justreal-white mt-2">
                      {stats.categoryCount[category as keyof typeof stats.categoryCount]}
                    </p>
                    <p className="text-justreal-gray-light text-sm">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="bg-justreal-black p-3 rounded border border-justreal-gray">
                <p className="text-justreal-white text-center">
                  <strong>{stats.total}</strong> komentar dianalisis
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {batchResults.results.length > 0 && (
          <Card className="bg-justreal-dark border-justreal-gray card-glow">
            <CardHeader>
              <CardTitle className="text-justreal-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-justreal-red" />
                Detail Hasil Analisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-justreal-gray">
                      <TableHead className="text-justreal-white">No</TableHead>
                      <TableHead className="text-justreal-white">Komentar</TableHead>
                      <TableHead className="text-justreal-white">Klasifikasi</TableHead>
                      <TableHead className="text-justreal-white">Skor Tertinggi</TableHead>
                      <TableHead className="text-justreal-white">Penjelasan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchResults.results.map((result, index) => {
                      const maxCategory = Object.entries(result.skor_kepercayaan)
                        .reduce((a, b) => a[1] > b[1] ? a : b);
                      
                      return (
                        <TableRow key={index} className="border-justreal-gray">
                          <TableCell className="text-justreal-white">{index + 1}</TableCell>
                          <TableCell className="text-justreal-gray-light max-w-xs truncate">
                            {result.original_comment}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {result.klasifikasi.map((category, i) => (
                                <Badge key={i} className={`${getCategoryColor(category)} text-xs`}>
                                  {category.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-justreal-white">
                            <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(maxCategory[0])}`}>
                              {maxCategory[0].replace('_', ' ')}: {(maxCategory[1] * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-justreal-gray-light text-sm max-w-xs truncate">
                            {result.penjelasan_singkat}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};

export default AnalysisResults;
