
import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, File, CheckCircle, AlertCircle, Download, Eye, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface EnhancedFileUploadProps {
  onDataLoaded: (data: string[]) => void;
}

const EnhancedFileUpload = ({ onDataLoaded }: EnhancedFileUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [previewData, setPreviewData] = useState<string[]>([]);
  const [fileStats, setFileStats] = useState<{
    totalRows: number;
    validComments: number;
    emptyRows: number;
  } | null>(null);
  
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let workbook;
          
          if (file.name.toLowerCase().endsWith('.csv')) {
            // Handle CSV files
            const text = data as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
              throw new Error('File CSV kosong');
            }
            
            // Parse CSV manually to handle different delimiters
            const delimiter = text.includes('\t') ? '\t' : 
                           text.includes(';') ? ';' : ',';
            
            const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
            const rows = lines.slice(1).map(line => {
              const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
            
            setColumns(headers);
            setFileData(rows);
            
          } else {
            // Handle Excel files
            workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
              throw new Error('File Excel kosong');
            }
            
            const headers = (jsonData[0] as string[]).filter(h => h);
            const rows = jsonData.slice(1).map((row: any) => {
              const rowObj: any = {};
              headers.forEach((header, index) => {
                rowObj[header] = row[index] || '';
              });
              return rowObj;
            }).filter(row => Object.values(row).some(val => val && val.toString().trim()));
            
            setColumns(headers);
            setFileData(rows);
          }
          
          // Calculate statistics
          const totalRows = fileData.length;
          const validComments = fileData.filter(row => 
            Object.values(row).some(val => val && val.toString().trim().length > 10)
          ).length;
          const emptyRows = totalRows - validComments;
          
          setFileStats({ totalRows, validComments, emptyRows });
          
          toast({
            title: "File berhasil dimuat",
            description: `${totalRows} baris data ditemukan dengan ${headers.length} kolom`
          });
          
        } catch (error) {
          console.error('Error processing file:', error);
          toast({
            title: "Error",
            description: `Gagal memproses file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
      } else {
        reader.readAsArrayBuffer(file);
      }
      
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Error",
        description: `Terjadi kesalahan saat memproses file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  }, [fileData.length, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const isValidType = validTypes.includes(file.type) || 
                       file.name.toLowerCase().endsWith('.csv') ||
                       file.name.toLowerCase().endsWith('.xlsx') ||
                       file.name.toLowerCase().endsWith('.xls');

    if (!isValidType) {
      toast({
        title: "Format file tidak didukung",
        description: "Mohon upload file CSV atau Excel (.xlsx, .xls)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    processFile(file);
  }, [processFile, toast]);

  const handleGoogleSheetLoad = useCallback(async () => {
    if (!googleSheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Mohon masukkan URL Google Sheet",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Extract sheet ID from URL
      const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('URL Google Sheet tidak valid');
      }
      
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Gagal mengakses Google Sheet. Pastikan sheet dapat diakses publik.');
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('Google Sheet kosong');
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val && val.toString().trim()));
      
      setColumns(headers);
      setFileData(rows);
      
      // Calculate statistics
      const totalRows = rows.length;
      const validComments = rows.filter(row => 
        Object.values(row).some(val => val && val.toString().trim().length > 10)
      ).length;
      const emptyRows = totalRows - validComments;
      
      setFileStats({ totalRows, validComments, emptyRows });
      
      toast({
        title: "Google Sheet berhasil dimuat",
        description: `${totalRows} baris data ditemukan dengan ${headers.length} kolom`
      });
      
    } catch (error) {
      console.error('Google Sheet error:', error);
      toast({
        title: "Error",
        description: `Gagal memuat Google Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [googleSheetUrl, toast]);

  const handleColumnSelect = useCallback((column: string) => {
    setSelectedColumn(column);
    
    if (column && fileData.length > 0) {
      const comments = fileData
        .map(row => row[column])
        .filter(comment => comment && comment.toString().trim())
        .map(comment => comment.toString().trim());
      
      setPreviewData(comments.slice(0, 5)); // Show first 5 for preview
      
      toast({
        title: "Kolom dipilih",
        description: `${comments.length} komentar valid ditemukan di kolom "${column}"`
      });
    }
  }, [fileData, toast]);

  const handleLoadData = useCallback(() => {
    if (!selectedColumn || fileData.length === 0) {
      toast({
        title: "Error",
        description: "Mohon pilih kolom yang berisi komentar terlebih dahulu",
        variant: "destructive"
      });
      return;
    }
    
    const comments = fileData
      .map(row => row[selectedColumn])
      .filter(comment => comment && comment.toString().trim())
      .map(comment => comment.toString().trim());
    
    if (comments.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada komentar valid ditemukan di kolom yang dipilih",
        variant: "destructive"
      });
      return;
    }
    
    onDataLoaded(comments);
    
    toast({
      title: "Data berhasil dimuat",
      description: `${comments.length} komentar siap untuk dianalisis`
    });
  }, [selectedColumn, fileData, onDataLoaded, toast]);

  const resetUpload = useCallback(() => {
    setUploadedFile(null);
    setFileData([]);
    setColumns([]);
    setSelectedColumn('');
    setGoogleSheetUrl('');
    setPreviewData([]);
    setFileStats(null);
  }, []);

  const downloadSampleFile = useCallback(() => {
    const sampleData = [
      ['komentar', 'pengguna', 'timestamp'],
      ['Ini adalah contoh komentar pertama yang akan dianalisis', 'user1', '2024-01-01'],
      ['Bagus sekali artikelnya, sangat bermanfaat untuk pembelajaran', 'user2', '2024-01-02'],
      ['Dasar bodoh semua yang komen di sini', 'user3', '2024-01-03'],
      ['Terima kasih atas informasinya yang sangat berguna', 'user4', '2024-01-04']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'justreal-sample-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <Card className="bg-justreal-dark border-justreal-gray card-glow">
      <CardHeader>
        <CardTitle className="text-justreal-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-justreal-red" />
          Upload File untuk Analisis Batch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Method Selection */}
        <div className="flex gap-4">
          <Button
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            onClick={() => setUploadMethod('file')}
            className={uploadMethod === 'file' 
              ? 'bg-justreal-red hover:bg-justreal-red-dark text-white' 
              : 'border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white'
            }
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <Button
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            onClick={() => setUploadMethod('url')}
            className={uploadMethod === 'url' 
              ? 'bg-justreal-red hover:bg-justreal-red-dark text-white' 
              : 'border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white'
            }
          >
            <FileText className="w-4 h-4 mr-2" />
            Google Sheet URL
          </Button>
        </div>

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-justreal-white mb-2 block">
                Pilih File (CSV, Excel)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="bg-justreal-black border-justreal-gray text-justreal-white file:bg-justreal-red file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSampleFile}
                  className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white whitespace-nowrap"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Contoh File
                </Button>
              </div>
              <p className="text-justreal-gray-light text-sm mt-2">
                Format yang didukung: CSV, Excel (.xlsx, .xls). Maksimal 10MB.
              </p>
            </div>
          </div>
        )}

        {/* Google Sheet URL */}
        {uploadMethod === 'url' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sheet-url" className="text-justreal-white mb-2 block">
                URL Google Sheet (Publik)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="sheet-url"
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  disabled={isProcessing}
                  className="bg-justreal-black border-justreal-gray text-justreal-white"
                />
                <Button
                  onClick={handleGoogleSheetLoad}
                  disabled={isProcessing || !googleSheetUrl.trim()}
                  className="bg-justreal-red hover:bg-justreal-red-dark text-white"
                >
                  {isProcessing ? 'Memuat...' : 'Muat'}
                </Button>
              </div>
              <p className="text-justreal-gray-light text-sm mt-2">
                Pastikan Google Sheet dapat diakses publik (Anyone with the link can view).
              </p>
            </div>
          </div>
        )}

        {/* File Information */}
        {(uploadedFile || googleSheetUrl) && fileStats && (
          <Alert className="bg-justreal-black border-justreal-gray">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-justreal-white">
              <div className="flex justify-between items-center">
                <div>
                  <strong>
                    {uploadedFile ? uploadedFile.name : 'Google Sheet'}
                  </strong>
                  {uploadedFile && (
                    <span className="text-justreal-gray-light ml-2">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUpload}
                  className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-red hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-justreal-white">{fileStats.totalRows}</div>
                  <div className="text-sm text-justreal-gray-light">Total Baris</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{fileStats.validComments}</div>
                  <div className="text-sm text-justreal-gray-light">Komentar Valid</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{fileStats.emptyRows}</div>
                  <div className="text-sm text-justreal-gray-light">Baris Kosong</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Column Selection */}
        {columns.length > 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="column-select" className="text-justreal-white mb-2 block">
                Pilih Kolom yang Berisi Komentar
              </Label>
              <Select value={selectedColumn} onValueChange={handleColumnSelect}>
                <SelectTrigger className="bg-justreal-black border-justreal-gray text-justreal-white">
                  <SelectValue placeholder="Pilih kolom..." />
                </SelectTrigger>
                <SelectContent className="bg-justreal-dark border-justreal-gray max-h-48">
                  {columns.map((column) => (
                    <SelectItem key={column} value={column} className="text-justreal-white focus:bg-justreal-red">
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Available Columns Preview */}
            <div className="bg-justreal-black p-3 rounded border border-justreal-gray">
              <h4 className="text-justreal-white font-medium mb-2">Kolom Tersedia:</h4>
              <div className="flex flex-wrap gap-2">
                {columns.map((column) => (
                  <Badge 
                    key={column} 
                    variant="outline" 
                    className="border-justreal-gray text-justreal-gray-light"
                  >
                    {column}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {previewData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-justreal-white font-medium">Preview Data (5 komentar pertama):</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {previewData.map((comment, index) => (
                <div 
                  key={index} 
                  className="bg-justreal-black p-3 rounded border border-justreal-gray text-justreal-gray-light text-sm"
                >
                  <span className="text-justreal-red font-mono">{index + 1}.</span> {comment}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load Data Button */}
        {selectedColumn && fileData.length > 0 && (
          <Button
            onClick={handleLoadData}
            className="w-full bg-justreal-red hover:bg-justreal-red-dark text-white font-semibold py-3"
          >
            <Eye className="w-4 h-4 mr-2" />
            Muat Data untuk Analisis ({fileData.filter(row => row[selectedColumn]?.toString().trim()).length} komentar)
          </Button>
        )}

        {/* Loading State */}
        {isProcessing && (
          <Alert className="bg-justreal-black border-justreal-gray">
            <AlertCircle className="h-4 w-4 text-justreal-red animate-spin" />
            <AlertDescription className="text-justreal-white">
              Memproses file, mohon tunggu...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedFileUpload;
