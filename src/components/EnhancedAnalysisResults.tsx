
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle, XCircle, Eye, Download, BarChart3, Filter, Search, SortAsc, SortDesc, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import DataVisualization from './DataVisualization';

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

interface EnhancedAnalysisResultsProps {
  result?: AnalysisResult;
  batchResults?: BatchResult;
  onClearResults?: () => void;
}

const EnhancedAnalysisResults = ({ result, batchResults, onClearResults }: EnhancedAnalysisResultsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortField, setSortField] = useState('index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showVisualizations, setShowVisualizations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const getRiskLevel = (result: AnalysisResult) => {
    const maxScore = Math.max(
      result.skor_kepercayaan.UJARAN_KEBENCIAN,
      result.skor_kepercayaan.BUZZER,
      result.skor_kepercayaan.SDM_RENDAH
    );
    
    if (maxScore >= 0.8) return { level: 'Sangat Tinggi', color: 'bg-red-600' };
    if (maxScore >= 0.6) return { level: 'Tinggi', color: 'bg-orange-600' };
    if (maxScore >= 0.4) return { level: 'Sedang', color: 'bg-yellow-600' };
    return { level: 'Rendah', color: 'bg-green-600' };
  };

  const filteredAndSortedResults = useMemo(() => {
    if (!batchResults?.results) return [];

    let filtered = batchResults.results.filter(result => {
      const matchesSearch = result.original_comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           result.penjelasan_singkat.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || 
                             result.klasifikasi.includes(filterCategory);

      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'comment':
          aValue = a.original_comment;
          bValue = b.original_comment;
          break;
        case 'risk':
          aValue = Math.max(...Object.values(a.skor_kepercayaan));
          bValue = Math.max(...Object.values(b.skor_kepercayaan));
          break;
        case 'category':
          aValue = a.klasifikasi[0] || '';
          bValue = b.klasifikasi[0] || '';
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [batchResults?.results, searchQuery, filterCategory, sortField, sortDirection]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedResults, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedResults.length / itemsPerPage);

  const downloadCSV = (results: AnalysisResult[]) => {
    const headers = [
      'No',
      'Komentar Asli',
      'Klasifikasi',
      'Tingkat Risiko',
      'Skor Ujaran Kebencian',
      'Skor Buzzer',
      'Skor SDM Rendah',
      'Skor Netral/Positif',
      'Penjelasan'
    ];

    const csvContent = [
      headers.join(','),
      ...results.map((result, index) => [
        index + 1,
        `"${result.original_comment.replace(/"/g, '""')}"`,
        `"${result.klasifikasi.join('; ')}"`,
        `"${getRiskLevel(result).level}"`,
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

  const downloadExcel = (results: AnalysisResult[]) => {
    // Convert to Excel format using a simple approach
    const data = results.map((result, index) => ({
      'No': index + 1,
      'Komentar Asli': result.original_comment,
      'Klasifikasi': result.klasifikasi.join('; '),
      'Tingkat Risiko': getRiskLevel(result).level,
      'Skor Ujaran Kebencian': result.skor_kepercayaan.UJARAN_KEBENCIAN,
      'Skor Buzzer': result.skor_kepercayaan.BUZZER,
      'Skor SDM Rendah': result.skor_kepercayaan.SDM_RENDAH,
      'Skor Netral/Positif': result.skor_kepercayaan.NETRAL_POSITIF,
      'Penjelasan': result.penjelasan_singkat
    }));

    // Create CSV content for Excel
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `justreal-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Single result display
  if (result) {
    const riskLevel = getRiskLevel(result);
    
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="bg-justreal-dark border-justreal-gray card-glow">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-justreal-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-justreal-red" />
                Hasil Analisis Komentar
              </CardTitle>
              {onClearResults && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearResults}
                  className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-red hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Bersihkan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Level Badge */}
            <div className="flex justify-center">
              <Badge className={`${riskLevel.color} text-white px-4 py-2 text-lg font-semibold`}>
                Tingkat Risiko: {riskLevel.level}
              </Badge>
            </div>

            {/* Original Comment */}
            <div>
              <h3 className="text-justreal-white font-semibold mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Komentar Asli:
              </h3>
              <div className="bg-justreal-black p-4 rounded-lg border-l-4 border-justreal-red">
                <p className="text-justreal-gray-light italic text-lg leading-relaxed">
                  "{result.original_comment}"
                </p>
              </div>
            </div>

            {/* Classification */}
            <div>
              <h3 className="text-justreal-white font-semibold mb-3">Klasifikasi:</h3>
              <div className="flex flex-wrap gap-3">
                {result.klasifikasi.map((category, index) => (
                  <Badge 
                    key={index} 
                    className={`${getCategoryColor(category)} flex items-center gap-2 px-3 py-2 text-sm font-medium`}
                  >
                    {getCategoryIcon(category)}
                    {category.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <h3 className="text-justreal-white font-semibold mb-3">Penjelasan AI:</h3>
              <div className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
                <p className="text-justreal-gray-light leading-relaxed">
                  {result.penjelasan_singkat}
                </p>
              </div>
            </div>

            {/* Confidence Scores */}
            <div>
              <h3 className="text-justreal-white font-semibold mb-4">Skor Kepercayaan Detail:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.skor_kepercayaan).map(([category, score]) => (
                  <div key={category} className="bg-justreal-black p-4 rounded-lg border border-justreal-gray">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-justreal-white font-medium flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {category.replace('_', ' ')}
                      </span>
                      <span className="text-justreal-gray-light font-mono text-lg">
                        {(score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={score * 100} 
                        className="h-3 bg-justreal-dark"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-700 ${getProgressColor(score)}`}
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
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Progress Card */}
        {batchResults.processed < batchResults.total && (
          <Card className="bg-justreal-dark border-justreal-gray card-glow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-justreal-white font-semibold text-lg mb-2">
                    Memproses Analisis Batch...
                  </h3>
                  <p className="text-justreal-gray-light">
                    {batchResults.processed} dari {batchResults.total} komentar telah dianalisis
                  </p>
                </div>
                <div className="w-48">
                  <Progress 
                    value={(batchResults.processed / batchResults.total) * 100} 
                    className="h-3"
                  />
                  <p className="text-justreal-gray-light text-sm mt-1 text-center">
                    {((batchResults.processed / batchResults.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Visualizations */}
        {showVisualizations && batchResults.results.length > 0 && (
          <Card className="bg-justreal-dark border-justreal-gray card-glow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-justreal-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-justreal-red" />
                  Visualisasi Data & Analitik
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCSV(batchResults.results)}
                    className="border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadExcel(batchResults.results)}
                    className="border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVisualizations(false)}
                    className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white"
                  >
                    Sembunyikan
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataVisualization results={batchResults.results} />
            </CardContent>
          </Card>
        )}

        {!showVisualizations && batchResults.results.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowVisualizations(true)}
              className="border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Tampilkan Visualisasi Data
            </Button>
          </div>
        )}

        {/* Enhanced Results Table */}
        {batchResults.results.length > 0 && (
          <Card className="bg-justreal-dark border-justreal-gray card-glow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-justreal-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-justreal-red" />
                  Tabel Hasil Detail ({filteredAndSortedResults.length} dari {batchResults.results.length})
                </CardTitle>
                {onClearResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearResults}
                    className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-red hover:text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Bersihkan Hasil
                  </Button>
                )}
              </div>
              
              {/* Filters and Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-justreal-gray-light" />
                  <Input
                    placeholder="Cari komentar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-justreal-black border-justreal-gray text-justreal-white pl-10"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white">
                    <SelectValue placeholder="Filter kategori..." />
                  </SelectTrigger>
                  <SelectContent className="bg-justreal-dark border-justreal-gray">
                    <SelectItem value="all" className="text-justreal-white">Semua Kategori</SelectItem>
                    <SelectItem value="UJARAN_KEBENCIAN" className="text-justreal-white">Ujaran Kebencian</SelectItem>
                    <SelectItem value="BUZZER" className="text-justreal-white">Buzzer</SelectItem>
                    <SelectItem value="SDM_RENDAH" className="text-justreal-white">SDM Rendah</SelectItem>
                    <SelectItem value="NETRAL_POSITIF" className="text-justreal-white">Netral/Positif</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white">
                    <SelectValue placeholder="Urutkan berdasarkan..." />
                  </SelectTrigger>
                  <SelectContent className="bg-justreal-dark border-justreal-gray">
                    <SelectItem value="index" className="text-justreal-white">Nomor</SelectItem>
                    <SelectItem value="comment" className="text-justreal-white">Komentar</SelectItem>
                    <SelectItem value="risk" className="text-justreal-white">Tingkat Risiko</SelectItem>
                    <SelectItem value="category" className="text-justreal-white">Kategori</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white"
                >
                  {sortDirection === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                  {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-justreal-gray hover:bg-justreal-black/50">
                      <TableHead className="text-justreal-white font-semibold">No</TableHead>
                      <TableHead className="text-justreal-white font-semibold min-w-[300px]">Komentar</TableHead>
                      <TableHead className="text-justreal-white font-semibold">Klasifikasi</TableHead>
                      <TableHead className="text-justreal-white font-semibold">Risiko</TableHead>
                      <TableHead className="text-justreal-white font-semibold">Skor Tertinggi</TableHead>
                      <TableHead className="text-justreal-white font-semibold min-w-[200px]">Penjelasan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result, index) => {
                      const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                      const maxCategory = Object.entries(result.skor_kepercayaan)
                        .reduce((a, b) => a[1] > b[1] ? a : b);
                      const riskLevel = getRiskLevel(result);
                      
                      return (
                        <TableRow 
                          key={actualIndex} 
                          className="border-justreal-gray hover:bg-justreal-black/30 transition-colors"
                        >
                          <TableCell className="text-justreal-white font-mono">
                            {actualIndex}
                          </TableCell>
                          <TableCell className="text-justreal-gray-light max-w-xs">
                            <div className="truncate" title={result.original_comment}>
                              {result.original_comment}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {result.klasifikasi.map((category, i) => (
                                <Badge key={i} className={`${getCategoryColor(category)} text-xs flex items-center gap-1`}>
                                  {getCategoryIcon(category)}
                                  {category.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${riskLevel.color} text-white px-2 py-1`}>
                              {riskLevel.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-justreal-white">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getCategoryColor(maxCategory[0])} text-xs`}>
                                {maxCategory[0].replace('_', ' ')}
                              </Badge>
                              <span className="font-mono text-sm">
                                {(maxCategory[1] * 100).toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-justreal-gray-light text-sm max-w-xs">
                            <div className="truncate" title={result.penjelasan_singkat}>
                              {result.penjelasan_singkat}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-justreal-gray">
                  <div className="flex items-center gap-2">
                    <span className="text-justreal-gray-light text-sm">Items per page:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-20 bg-justreal-black border-justreal-gray text-justreal-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-justreal-dark border-justreal-gray">
                        <SelectItem value="5" className="text-justreal-white">5</SelectItem>
                        <SelectItem value="10" className="text-justreal-white">10</SelectItem>
                        <SelectItem value="25" className="text-justreal-white">25</SelectItem>
                        <SelectItem value="50" className="text-justreal-white">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white disabled:opacity-50"
                    >
                      Sebelumnya
                    </Button>
                    
                    <span className="text-justreal-white px-3 py-1 bg-justreal-black rounded border border-justreal-gray">
                      {currentPage} dari {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white disabled:opacity-50"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};

export default EnhancedAnalysisResults;
