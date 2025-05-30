
export interface AnalysisResult {
  original_comment: string;
  klasifikasi: string[];
  skor_kepercayaan: {
    UJARAN_KEBENCIAN: number;
    BUZZER: number;
    SDM_RENDAH: number;
    NETRAL_POSITIF: number;
    POSITIF: number;
    NEGATIF: number;
    NETRAL: number;
  };
  penjelasan_singkat: string;
  sentimen_umum: 'POSITIF' | 'NEGATIF' | 'NETRAL';
  tingkat_toksisitas: number;
}

export interface Provider {
  value: string;
  label: string;
  models: string[];
  endpoint: string;
}

export interface EfficiencyModeProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  commentCount: number;
}
