
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, Link, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onDataLoaded: (data: string[]) => void;
}

const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let data: any[][] = [];

      if (fileExtension === 'csv') {
        const text = await file.text();
        const lines = text.split('\n');
        data = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      } else {
        throw new Error('Format file tidak didukung. Gunakan CSV atau Excel (.xlsx/.xls)');
      }

      if (data.length === 0) {
        throw new Error('File kosong atau tidak valid');
      }

      // Set columns from first row (headers)
      const headers = data[0]?.map((header, index) => 
        header?.toString().trim() || `Kolom ${index + 1}`
      ) || [];
      
      setColumns(headers);
      
      // Store the data for processing
      window.uploadedFileData = data;
      
      toast({
        title: "File Berhasil Dimuat",
        description: `${data.length - 1} baris data ditemukan. Pilih kolom yang berisi komentar.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Gagal memuat file',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSheetLoad = async () => {
    if (!googleSheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Masukkan URL Google Sheet terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Extract sheet ID from URL
      const sheetIdMatch = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('URL Google Sheet tidak valid');
      }

      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Gagal mengakses Google Sheet. Pastikan sheet bersifat publik.');
      }

      const csvData = await response.text();
      const lines = csvData.split('\n');
      const data = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));

      if (data.length === 0) {
        throw new Error('Google Sheet kosong atau tidak valid');
      }

      // Set columns from first row (headers)
      const headers = data[0]?.map((header, index) => 
        header?.toString().trim() || `Kolom ${index + 1}`
      ) || [];
      
      setColumns(headers);
      
      // Store the data for processing
      window.uploadedFileData = data;
      
      toast({
        title: "Google Sheet Berhasil Dimuat",
        description: `${data.length - 1} baris data ditemukan. Pilih kolom yang berisi komentar.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Gagal memuat Google Sheet',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleColumnSelect = () => {
    if (!selectedColumn || !window.uploadedFileData) {
      toast({
        title: "Error",
        description: "Pilih kolom terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = window.uploadedFileData as any[][];
      const headers = data[0];
      const columnIndex = headers.findIndex((header: string) => header === selectedColumn);
      
      if (columnIndex === -1) {
        throw new Error('Kolom tidak ditemukan');
      }

      // Extract comments from selected column (skip header row)
      const comments = data.slice(1)
        .map(row => row[columnIndex]?.toString().trim())
        .filter(comment => comment && comment.length > 0);

      if (comments.length === 0) {
        throw new Error('Tidak ada komentar valid ditemukan di kolom tersebut');
      }

      onDataLoaded(comments);
      
      toast({
        title: "Data Siap Dianalisis",
        description: `${comments.length} komentar berhasil dimuat dari kolom "${selectedColumn}"`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Gagal memproses data',
        variant: "destructive"
      });
    }
  };

  const clearData = () => {
    setColumns([]);
    setSelectedColumn('');
    setGoogleSheetUrl('');
    onDataLoaded([]);
    window.uploadedFileData = null;
    
    toast({
      title: "Data Dibersihkan",
      description: "Semua data upload telah dibersihkan"
    });
  };

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <Card className="bg-justreal-black border-justreal-gray">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-justreal-white mb-2 block">
                <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                Upload File (CSV, Excel)
              </Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="bg-justreal-dark border-justreal-gray text-justreal-white file:bg-justreal-red file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
              />
            </div>

            <div className="flex items-center text-justreal-gray-light">
              <div className="flex-1 border-t border-justreal-gray"></div>
              <span className="px-4 text-sm">ATAU</span>
              <div className="flex-1 border-t border-justreal-gray"></div>
            </div>

            <div>
              <Label className="text-justreal-white mb-2 block">
                <Link className="w-4 h-4 inline mr-2" />
                URL Google Sheet (Publik)
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  disabled={isLoading}
                  className="bg-justreal-dark border-justreal-gray text-justreal-white placeholder:text-justreal-gray-light"
                />
                <Button
                  onClick={handleGoogleSheetLoad}
                  disabled={isLoading || !googleSheetUrl.trim()}
                  className="bg-justreal-red hover:bg-justreal-red-dark text-white px-6"
                >
                  {isLoading ? <Upload className="w-4 h-4 animate-spin" /> : 'Muat'}
                </Button>
              </div>
              <p className="text-xs text-justreal-gray-light mt-1">
                ℹ️ Pastikan Google Sheet dapat diakses publik
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Selection */}
      {columns.length > 0 && (
        <Card className="bg-justreal-black border-justreal-gray">
          <CardContent className="p-4">
            <div className="space-y-4">
              <Label className="text-justreal-white">Pilih Kolom yang Berisi Komentar</Label>
              <div className="flex gap-2">
                <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                  <SelectTrigger className="bg-justreal-dark border-justreal-gray text-justreal-white">
                    <SelectValue placeholder="Pilih kolom..." />
                  </SelectTrigger>
                  <SelectContent className="bg-justreal-dark border-justreal-gray">
                    {columns.map((column, index) => (
                      <SelectItem key={index} value={column} className="text-justreal-white focus:bg-justreal-red">
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleColumnSelect}
                  disabled={!selectedColumn}
                  className="bg-justreal-red hover:bg-justreal-red-dark text-white px-6"
                >
                  Proses
                </Button>
                <Button
                  onClick={clearData}
                  variant="outline"
                  className="border-justreal-gray text-justreal-gray-light hover:bg-justreal-gray hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Add to window type
declare global {
  interface Window {
    uploadedFileData: any[][] | null;
  }
}

export default FileUpload;
