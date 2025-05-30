
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const AboutSection = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <Info className="w-5 h-5 text-justreal-red" />
            Tentang JustReal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-justreal-gray-light text-sm">
            JustReal menggunakan sistem instruksi REAL untuk mengklasifikasikan komentar berbahasa Indonesia ke dalam kategori:
          </p>
          <ul className="text-justreal-gray-light text-sm space-y-1 ml-4">
            <li>• <span className="text-red-400">Ujaran Kebencian</span></li>
            <li>• <span className="text-orange-400">Buzzer</span></li>
            <li>• <span className="text-yellow-400">SDM Rendah</span></li>
            <li>• <span className="text-green-400">Netral/Positif</span></li>
          </ul>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full border-justreal-red text-justreal-red hover:bg-justreal-red hover:text-white"
          >
            {showInstructions ? 'Sembunyikan' : 'Lihat'} Sistem Instruksi REAL
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {showInstructions && (
        <Card className="bg-justreal-dark border-justreal-gray card-glow">
          <CardHeader>
            <CardTitle className="text-justreal-white text-lg">Sistem Instruksi REAL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-justreal-gray-light text-sm space-y-3 max-h-96 overflow-y-auto">
              <div>
                <h4 className="text-justreal-white font-semibold mb-2">Definisi Kategori:</h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-red-400 font-medium">1. UJARAN_KEBENCIAN</h5>
                    <p>Komentar yang secara eksplisit atau implisit menyerang, merendahkan, menghina, mengancam, atau mempromosikan diskriminasi terhadap individu atau kelompok berdasarkan atribut seperti suku, agama, ras, etnis, warna kulit, asal-usul kebangsaan, jenis kelamin, identitas gender, orientasi seksual, disabilitas, kondisi medis, atau status sosial-ekonomi.</p>
                  </div>

                  <div>
                    <h5 className="text-orange-400 font-medium">2. BUZZER</h5>
                    <p>Komentar yang menunjukkan ciri-ciri aktivitas terkoordinasi, manipulatif, atau tidak organik. Termasuk pola komentar seragam, promosi berlebihan, penggunaan hashtag tidak relevan secara masif, copy-paste template, atau narasi yang terlalu ekstrem untuk membangun/menjatuhkan citra.</p>
                  </div>

                  <div>
                    <h5 className="text-yellow-400 font-medium">3. SDM_RENDAH</h5>
                    <p>Komentar yang menunjukkan kualitas interaksi yang buruk, tidak sopan, atau tidak kontributif. Termasuk bahasa kasar/vulgar, provokasi murahan, ad hominem, komentar tidak relevan (OOT), komentar dangkal/tidak berisi, misinformasi sederhana, atau toxic secara umum.</p>
                  </div>

                  <div>
                    <h5 className="text-green-400 font-medium">4. NETRAL_POSITIF</h5>
                    <p>Komentar yang tidak termasuk dalam kategori di atas. Bisa berupa opini yang disampaikan dengan sopan, pertanyaan, fakta, apresiasi, dukungan, atau kritik konstruktif.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-justreal-black rounded-lg border border-justreal-gray">
                <p className="text-justreal-red font-medium mb-2">Catatan Penting:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Sebuah komentar bisa masuk ke dalam lebih dari satu kategori</li>
                  <li>• Analisis fokus pada isi dan konteks komentar</li>
                  <li>• Sistem dirancang khusus untuk Bahasa Indonesia</li>
                  <li>• Hasil bergantung pada kemampuan LLM yang dipilih</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-justreal-dark border-justreal-gray">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-justreal-gray-light text-xs">
              🔒 <strong>Privacy First:</strong> Data tidak disimpan secara permanen
            </p>
            <p className="text-justreal-gray-light text-xs">
              🤖 <strong>Transparansi:</strong> Sistem instruksi terbuka dan dapat diperiksa
            </p>
            <p className="text-justreal-gray-light text-xs">
              🎯 <strong>Akurasi:</strong> Menggunakan LLM terdepan dengan panduan khusus
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutSection;
