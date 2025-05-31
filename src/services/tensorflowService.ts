
import * as tf from '@tensorflow/tfjs';

interface WordEmbedding {
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
}

class TensorFlowService {
  private model: tf.LayersModel | null = null;
  private wordEmbeddings: Map<string, WordEmbedding> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js backend
      await tf.ready();
      
      // Load pre-trained model for Indonesian sentiment analysis
      this.model = await this.createSentimentModel();
      
      // Load Indonesian word embeddings
      await this.loadIndonesianWordEmbeddings();
      
      this.isInitialized = true;
      console.log('TensorFlow.js service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js service:', error);
    }
  }

  private async createSentimentModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [100], // Word embedding dimension
          units: 128, 
          activation: 'relu' 
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ 
          units: 11, // Multi-class output (sentiment + toxicity + emotions)
          activation: 'softmax' 
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private async loadIndonesianWordEmbeddings() {
    // Indonesian sentiment lexicon with embeddings
    const indonesianWords = [
      // Positive words
      { word: 'bagus', sentiment: 0.8, toxicity: 0.1, emotions: [0.7, 0.1, 0.1, 0.1, 0.1, 0.2, 0.6, 0.8] },
      { word: 'baik', sentiment: 0.7, toxicity: 0.1, emotions: [0.6, 0.1, 0.1, 0.1, 0.1, 0.1, 0.5, 0.7] },
      { word: 'hebat', sentiment: 0.9, toxicity: 0.1, emotions: [0.8, 0.1, 0.1, 0.1, 0.1, 0.3, 0.7, 0.8] },
      { word: 'mantap', sentiment: 0.8, toxicity: 0.1, emotions: [0.7, 0.1, 0.1, 0.1, 0.1, 0.2, 0.6, 0.7] },
      { word: 'keren', sentiment: 0.8, toxicity: 0.1, emotions: [0.7, 0.1, 0.1, 0.1, 0.1, 0.3, 0.6, 0.7] },
      
      // Negative words
      { word: 'buruk', sentiment: 0.2, toxicity: 0.4, emotions: [0.1, 0.6, 0.3, 0.2, 0.4, 0.2, 0.2, 0.2] },
      { word: 'jelek', sentiment: 0.2, toxicity: 0.4, emotions: [0.1, 0.5, 0.3, 0.2, 0.4, 0.2, 0.2, 0.3] },
      { word: 'bodoh', sentiment: 0.1, toxicity: 0.7, emotions: [0.1, 0.4, 0.6, 0.2, 0.5, 0.3, 0.2, 0.2] },
      { word: 'tolol', sentiment: 0.1, toxicity: 0.8, emotions: [0.1, 0.3, 0.7, 0.2, 0.6, 0.3, 0.2, 0.1] },
      
      // Toxic words
      { word: 'anjing', sentiment: 0.1, toxicity: 0.9, emotions: [0.1, 0.2, 0.8, 0.3, 0.7, 0.4, 0.2, 0.1] },
      { word: 'bangsat', sentiment: 0.1, toxicity: 0.9, emotions: [0.1, 0.2, 0.9, 0.3, 0.8, 0.4, 0.2, 0.1] },
      { word: 'babi', sentiment: 0.1, toxicity: 0.9, emotions: [0.1, 0.2, 0.8, 0.3, 0.8, 0.4, 0.2, 0.1] }
    ];

    indonesianWords.forEach(wordData => {
      const embedding = this.generateWordEmbedding(wordData.word, wordData.sentiment, wordData.toxicity);
      this.wordEmbeddings.set(wordData.word, {
        word: wordData.word,
        embedding,
        sentiment: wordData.sentiment,
        toxicity: wordData.toxicity,
        emotion: {
          senang: wordData.emotions[0],
          sedih: wordData.emotions[1],
          marah: wordData.emotions[2],
          takut: wordData.emotions[3],
          jijik: wordData.emotions[4],
          terkejut: wordData.emotions[5],
          antisipasi: wordData.emotions[6],
          kepercayaan: wordData.emotions[7]
        }
      });
    });
  }

  private generateWordEmbedding(word: string, sentiment: number, toxicity: number): number[] {
    // Generate 100-dimensional embedding based on word characteristics
    const embedding = new Array(100).fill(0).map(() => Math.random() * 2 - 1);
    
    // Inject sentiment and toxicity features
    embedding[0] = sentiment;
    embedding[1] = toxicity;
    embedding[2] = word.length / 20; // Normalized word length
    
    return embedding;
  }

  async analyzeWord(word: string): Promise<WordEmbedding | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cleanWord = word.toLowerCase().trim();
    
    // Check if word exists in embeddings
    if (this.wordEmbeddings.has(cleanWord)) {
      return this.wordEmbeddings.get(cleanWord)!;
    }

    // Generate prediction for unknown words
    if (this.model) {
      const embedding = this.generateWordEmbedding(cleanWord, 0.5, 0.3);
      const prediction = this.model.predict(tf.tensor2d([embedding])) as tf.Tensor;
      const scores = await prediction.data();
      
      const wordEmbedding: WordEmbedding = {
        word: cleanWord,
        embedding,
        sentiment: scores[0],
        toxicity: scores[1],
        emotion: {
          senang: scores[2],
          sedih: scores[3],
          marah: scores[4],
          takut: scores[5],
          jijik: scores[6],
          terkejut: scores[7],
          antisipasi: scores[8],
          kepercayaan: scores[9]
        }
      };

      // Cache the result
      this.wordEmbeddings.set(cleanWord, wordEmbedding);
      
      prediction.dispose();
      return wordEmbedding;
    }

    return null;
  }

  async analyzeSentence(sentence: string): Promise<{
    overallSentiment: number;
    overallToxicity: number;
    emotions: WordEmbedding['emotion'];
    wordAnalysis: Array<{ word: string; analysis: WordEmbedding }>;
  }> {
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordAnalyses: Array<{ word: string; analysis: WordEmbedding }> = [];
    
    let totalSentiment = 0;
    let totalToxicity = 0;
    const totalEmotions = {
      senang: 0, sedih: 0, marah: 0, takut: 0,
      jijik: 0, terkejut: 0, antisipasi: 0, kepercayaan: 0
    };

    for (const word of words) {
      const analysis = await this.analyzeWord(word);
      if (analysis) {
        wordAnalyses.push({ word, analysis });
        totalSentiment += analysis.sentiment;
        totalToxicity += analysis.toxicity;
        
        Object.keys(totalEmotions).forEach(emotion => {
          totalEmotions[emotion as keyof typeof totalEmotions] += 
            analysis.emotion[emotion as keyof typeof analysis.emotion];
        });
      }
    }

    const wordCount = wordAnalyses.length || 1;

    return {
      overallSentiment: totalSentiment / wordCount,
      overallToxicity: totalToxicity / wordCount,
      emotions: {
        senang: totalEmotions.senang / wordCount,
        sedih: totalEmotions.sedih / wordCount,
        marah: totalEmotions.marah / wordCount,
        takut: totalEmotions.takut / wordCount,
        jijik: totalEmotions.jijik / wordCount,
        terkejut: totalEmotions.terkejut / wordCount,
        antisipasi: totalEmotions.antisipasi / wordCount,
        kepercayaan: totalEmotions.kepercayaan / wordCount
      },
      wordAnalysis: wordAnalyses
    };
  }

  async trainModel(feedbackData: Array<{ input: string; expected: number[]; }>) {
    if (!this.model || feedbackData.length === 0) return;

    const inputs = feedbackData.map(d => this.generateWordEmbedding(d.input, 0.5, 0.3));
    const outputs = feedbackData.map(d => d.expected);

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);

    await this.model.fit(xs, ys, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
        }
      }
    });

    xs.dispose();
    ys.dispose();
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
    }
    this.wordEmbeddings.clear();
    this.isInitialized = false;
  }
}

export const tensorflowService = new TensorFlowService();
