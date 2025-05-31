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

export interface TensorFlowAnalysis {
  emotions: {
    senang: number;
    sedih: number;
    marah: number;
    takut: number;
    jijik: number;
    terkejut: number;
    antisipasi: number;
    kepercayaan: number;
  };
  wordAnalysis: Array<{
    word: string;
    analysis: {
      word: string;
      embedding: number[];
      sentiment: number;
      toxicity: number;
      emotion: {
        senang: number;
        sedih: number;
        marah: number;
        takut: number;
        jijik: number;
        terkejut: number;
        antisipasi: number;
        kepercayaan: number;
      };
    };
  }>;
  overallSentiment: number;
  overallToxicity: number;
}

// Extend AnalysisResult to include TensorFlow analysis
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
  tensorflow_analysis?: TensorFlowAnalysis;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'image';
  includeCharts: boolean;
  includeRawData: boolean;
  includeAnalysis: boolean;
}

export interface FeedbackData {
  commentIndex: number;
  originalSentiment: string;
  correctedSentiment: string;
  isCorrect: boolean;
  userComment?: string;
}
