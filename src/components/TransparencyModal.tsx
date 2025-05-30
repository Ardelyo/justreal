
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Brain, Code, Shield, Workflow } from 'lucide-react';

interface TransparencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransparencyModal = ({ open, onOpenChange }: TransparencyModalProps) => {
  const systemPrompt = `Anda adalah REAL (Rangkaian Evaluasi Anti-Lidah), sebuah model AI yang dilatih khusus untuk menganalisis dan mengklasifikasikan komentar berbahasa Indonesia. Tugas Anda adalah membaca komentar yang diberikan dengan saksama dan menentukan apakah komentar tersebut termasuk dalam satu atau lebih kategori berikut: UJARAN_KEBENCIAN, BUZZER, SDM_RENDAH, atau NETRAL_POSITIF.

Definisi Kategori:
1. UJARAN_KEBENCIAN: Komentar yang secara eksplisit atau implisit menyerang, merendahkan, menghina, mengancam, atau mempromosikan diskriminasi terhadap individu atau kelompok berdasarkan atribut seperti suku, agama, ras, etnis, warna kulit, asal-usul kebangsaan, jenis kelamin, identitas gender, orientasi seksual, disabilitas, kondisi medis, atau status sosial-ekonomi.

2. BUZZER: Komentar yang menunjukkan ciri-ciri aktivitas terkoordinasi, manipulatif, atau tidak organik. Ciri-cirinya bisa meliputi pola komentar seragam, promosi berlebihan, penggunaan tagar tidak relevan secara masif, komentar copy-paste, atau narasi yang terlalu positif/negatif secara tidak wajar.

3. SDM_RENDAH: Komentar yang menunjukkan kualitas interaksi yang buruk, tidak sopan, atau tidak kontributif, termasuk bahasa kasar/vulgar, provokasi murahan, ad hominem, tidak relevan (OOT), komentar dangkal, misinformasi sederhana, atau toxic umum.

4. NETRAL_POSITIF: Komentar yang tidak termasuk dalam kategori di atas, seperti opini sopan, pertanyaan, fakta, apresiasi, dukungan, atau kritik konstruktif.

Berikan output HANYA dalam format JSON yang valid dengan kunci:
- "klasifikasi": array string nama kategori
- "skor_kepercayaan": objek dengan keempat kategori sebagai kunci dan skor 0.0-1.0 sebagai nilai
- "penjelasan_singkat": string singkat alasan klasifikasi (maksimal 2 kalimat)

Analisis komentar berikut: "[KOMENTAR_USER]"`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-justreal-dark border-justreal-gray">
        <DialogHeader>
          <DialogTitle className="text-justreal-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-justreal-red" />
            Transparansi JustReal: Cara Kerja & Sistem Instruksi
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-justreal-black">
            <TabsTrigger value="overview" className="data-[state=active]:bg-justreal-red data-[state=active]:text-white">
              <Workflow className="w-4 h-4 mr-2" />
              Gambaran
            </TabsTrigger>
            <TabsTrigger value="prompt" className="data-[state=active]:bg-justreal-red data-[state=active]:text-white">
              <Code className="w-4 h-4 mr-2" />
              Sistem Prompt
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-justreal-red data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              Kategori
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-justreal-red data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Privasi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-justreal-black border-justreal-gray">
              <CardHeader>
                <CardTitle className="text-justreal-white">Bagaimana JustReal Bekerja</CardTitle>
              </CardHeader>
              <CardContent className="text-justreal-gray-light space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-justreal-red rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div>
                      <h4 className="text-justreal-white font-semibold">Input & Konfigurasi</h4>
                      <p>Anda memasukkan komentar dan mengonfigurasi penyedia AI (OpenAI, Gemini, OpenRouter, HuggingFace) dengan API key Anda sendiri.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-justreal-red rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div>
                      <h4 className="text-justreal-white font-semibold">Sistem Instruksi REAL</h4>
                      <p>JustReal menggunakan sistem instruksi yang telah dirancang khusus untuk menganalisis komentar berbahasa Indonesia berdasarkan 4 kategori.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-justreal-red rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div>
                      <h4 className="text-justreal-white font-semibold">Analisis AI</h4>
                      <p>Komentar Anda dikirim ke API AI yang dipilih bersama dengan sistem instruksi. AI menganalisis dan memberikan klasifikasi serta skor kepercayaan.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-justreal-red rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                    <div>
                      <h4 className="text-justreal-white font-semibold">Hasil Terstruktur</h4>
                      <p>Hasil ditampilkan dalam format yang mudah dipahami dengan visualisasi skor dan penjelasan singkat.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-justreal-dark rounded border border-justreal-gray">
                  <h4 className="text-justreal-white font-semibold mb-2">🔍 Transparansi Penuh</h4>
                  <p>JustReal tidak menggunakan model AI yang di-fine-tune secara khusus. Kami mengandalkan kemampuan model AI umum yang dipandu oleh sistem instruksi REAL yang dapat Anda lihat secara lengkap di tab "Sistem Prompt".</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4">
            <Card className="bg-justreal-black border-justreal-gray">
              <CardHeader>
                <CardTitle className="text-justreal-white">Sistem Prompt REAL (Lengkap)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-justreal-dark p-4 rounded border border-justreal-gray">
                  <pre className="text-justreal-gray-light text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                    {systemPrompt}
                  </pre>
                </div>
                <p className="text-justreal-gray-light text-sm mt-4">
                  ℹ️ Prompt ini dikirim persis seperti di atas ke API AI yang Anda pilih, bersama dengan komentar yang ingin dianalisis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-justreal-black border-justreal-gray">
                <CardHeader>
                  <CardTitle className="text-justreal-white flex items-center gap-2">
                    <Badge className="bg-red-600 text-white">UJARAN KEBENCIAN</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-justreal-gray-light">
                  <p>Komentar yang menyerang atau mendiskriminasi berdasarkan SARA, identitas gender, orientasi seksual, disabilitas, atau status sosial-ekonomi.</p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-justreal-white">Contoh:</p>
                    <p className="text-sm italic">"Dasar [kelompok tertentu] goblok, pantas aja miskin!"</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-justreal-black border-justreal-gray">
                <CardHeader>
                  <CardTitle className="text-justreal-white flex items-center gap-2">
                    <Badge className="bg-orange-600 text-white">BUZZER</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-justreal-gray-light">
                  <p>Komentar yang menunjukkan aktivitas terkoordinasi, manipulatif, atau tidak organik dengan pola seragam.</p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-justreal-white">Contoh:</p>
                    <p className="text-sm italic">"Hanya [tokoh] yang bisa memimpin! #Dukung2024" (berulang dari banyak akun)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-justreal-black border-justreal-gray">
                <CardHeader>
                  <CardTitle className="text-justreal-white flex items-center gap-2">
                    <Badge className="bg-yellow-600 text-white">SDM RENDAH</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-justreal-gray-light">
                  <p>Komentar dengan kualitas interaksi buruk: bahasa kasar, provokasi, ad hominem, tidak relevan, atau toxic umum.</p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-justreal-white">Contoh:</p>
                    <p className="text-sm italic">"Goblok banget yang komen di atas gue."</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-justreal-black border-justreal-gray">
                <CardHeader>
                  <CardTitle className="text-justreal-white flex items-center gap-2">
                    <Badge className="bg-green-600 text-white">NETRAL POSITIF</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-justreal-gray-light">
                  <p>Komentar yang tidak masuk kategori lain: opini sopan, pertanyaan, fakta, apresiasi, atau kritik konstruktif.</p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-justreal-white">Contoh:</p>
                    <p className="text-sm italic">"Saya setuju dengan poin A, tapi bagaimana dengan aspek B?"</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card className="bg-justreal-black border-justreal-gray">
              <CardHeader>
                <CardTitle className="text-justreal-white">Komitmen Privasi & Keamanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-justreal-gray-light">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-justreal-red mt-1" />
                    <div>
                      <h4 className="text-justreal-white font-semibold">API Key Anda, Kendali Anda</h4>
                      <p>JustReal tidak menyimpan API key Anda secara permanen. API key hanya digunakan selama sesi analisis dan langsung dihapus setelahnya.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-justreal-red mt-1" />
                    <div>
                      <h4 className="text-justreal-white font-semibold">Data Komentar</h4>
                      <p>Komentar yang Anda analisis tidak disimpan di server JustReal. Data hanya diproses sementara untuk analisis.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-justreal-red mt-1" />
                    <div>
                      <h4 className="text-justreal-white font-semibold">Komunikasi Langsung</h4>
                      <p>JustReal berperan sebagai proxy yang aman. Komunikasi dilakukan langsung antara browser Anda dan API penyedia AI yang dipilih.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-justreal-red mt-1" />
                    <div>
                      <h4 className="text-justreal-white font-semibold">Open Source Spirit</h4>
                      <p>Sistem instruksi REAL sepenuhnya terbuka dan dapat diverifikasi. Tidak ada "black box" dalam proses analisis.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-justreal-dark rounded border border-justreal-gray">
                  <h4 className="text-justreal-white font-semibold mb-2">⚠️ Disclaimer</h4>
                  <p>Hasil analisis bergantung pada kemampuan model AI yang Anda pilih. JustReal adalah alat bantu, bukan pengganti penilaian manusia untuk kasus sensitif atau keputusan penting.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TransparencyModal;
