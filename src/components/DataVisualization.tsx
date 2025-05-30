
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

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

interface DataVisualizationProps {
  results: AnalysisResult[];
}

const DataVisualization = ({ results }: DataVisualizationProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UJARAN_KEBENCIAN':
        return '#dc2626';
      case 'BUZZER':
        return '#ea580c';
      case 'SDM_RENDAH':
        return '#ca8a04';
      case 'NETRAL_POSITIF':
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  const getCategoryData = () => {
    const categoryCount = {
      'UJARAN_KEBENCIAN': 0,
      'BUZZER': 0,
      'SDM_RENDAH': 0,
      'NETRAL_POSITIF': 0
    };

    results.forEach(result => {
      result.klasifikasi.forEach(kategori => {
        if (kategori in categoryCount) {
          categoryCount[kategori as keyof typeof categoryCount]++;
        }
      });
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
      color: getCategoryColor(name),
      percentage: ((value / results.length) * 100).toFixed(1)
    }));
  };

  const getScoreDistribution = () => {
    const scoreRanges = {
      'Sangat Rendah (0-0.2)': { UJARAN_KEBENCIAN: 0, BUZZER: 0, SDM_RENDAH: 0, NETRAL_POSITIF: 0 },
      'Rendah (0.2-0.4)': { UJARAN_KEBENCIAN: 0, BUZZER: 0, SDM_RENDAH: 0, NETRAL_POSITIF: 0 },
      'Sedang (0.4-0.6)': { UJARAN_KEBENCIAN: 0, BUZZER: 0, SDM_RENDAH: 0, NETRAL_POSITIF: 0 },
      'Tinggi (0.6-0.8)': { UJARAN_KEBENCIAN: 0, BUZZER: 0, SDM_RENDAH: 0, NETRAL_POSITIF: 0 },
      'Sangat Tinggi (0.8-1.0)': { UJARAN_KEBENCIAN: 0, BUZZER: 0, SDM_RENDAH: 0, NETRAL_POSITIF: 0 }
    };

    results.forEach(result => {
      Object.entries(result.skor_kepercayaan).forEach(([category, score]) => {
        let range;
        if (score < 0.2) range = 'Sangat Rendah (0-0.2)';
        else if (score < 0.4) range = 'Rendah (0.2-0.4)';
        else if (score < 0.6) range = 'Sedang (0.4-0.6)';
        else if (score < 0.8) range = 'Tinggi (0.6-0.8)';
        else range = 'Sangat Tinggi (0.8-1.0)';

        scoreRanges[range][category as keyof typeof scoreRanges[typeof range]]++;
      });
    });

    return Object.entries(scoreRanges).map(([range, counts]) => ({
      range,
      UJARAN_KEBENCIAN: counts.UJARAN_KEBENCIAN,
      BUZZER: counts.BUZZER,
      SDM_RENDAH: counts.SDM_RENDAH,
      NETRAL_POSITIF: counts.NETRAL_POSITIF
    }));
  };

  const getAverageScores = () => {
    const totals = { UJARAN_KEBENCIAN: 0, BUZZER: 0, SDM_RENDAH: 0, NETRAL_POSITIF: 0 };
    
    results.forEach(result => {
      Object.entries(result.skor_kepercayaan).forEach(([category, score]) => {
        totals[category as keyof typeof totals] += score;
      });
    });

    return Object.entries(totals).map(([category, total]) => ({
      category: category.replace('_', ' '),
      average: ((total / results.length) * 100).toFixed(1),
      color: getCategoryColor(category)
    }));
  };

  const categoryData = getCategoryData();
  const scoreDistribution = getScoreDistribution();
  const averageScores = getAverageScores();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Distribution Pie Chart */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-justreal-red" />
            Distribusi Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  `${value} komentar (${categoryData.find(d => d.name === name)?.percentage}%)`,
                  name
                ]}
              />
              <Legend 
                wrapperStyle={{ color: '#fff' }}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({categoryData.find(d => d.name === value)?.value} komentar)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Scores Bar Chart */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-justreal-red" />
            Rata-rata Skor Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averageScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="category" 
                tick={{ fill: '#fff', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`${value}%`, 'Rata-rata Skor']}
              />
              <Bar dataKey="average" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Distribution Stacked Bar Chart */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-justreal-red" />
            Distribusi Rentang Skor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="range" 
                tick={{ fill: '#fff', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Area 
                type="monotone" 
                dataKey="UJARAN_KEBENCIAN" 
                stackId="1" 
                stroke="#dc2626" 
                fill="#dc2626" 
                fillOpacity={0.6}
                name="Ujaran Kebencian"
              />
              <Area 
                type="monotone" 
                dataKey="BUZZER" 
                stackId="1" 
                stroke="#ea580c" 
                fill="#ea580c" 
                fillOpacity={0.6}
                name="Buzzer"
              />
              <Area 
                type="monotone" 
                dataKey="SDM_RENDAH" 
                stackId="1" 
                stroke="#ca8a04" 
                fill="#ca8a04" 
                fillOpacity={0.6}
                name="SDM Rendah"
              />
              <Area 
                type="monotone" 
                dataKey="NETRAL_POSITIF" 
                stackId="1" 
                stroke="#16a34a" 
                fill="#16a34a" 
                fillOpacity={0.6}
                name="Netral Positif"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics Cards */}
      <Card className="bg-justreal-dark border-justreal-gray card-glow lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-justreal-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-justreal-red" />
            Ringkasan Statistik Detail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoryData.map((category) => (
              <div key={category.name} className="text-center p-4 rounded-lg bg-justreal-black border border-justreal-gray">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: category.color }}
                >
                  {category.value}
                </div>
                <h3 className="text-justreal-white font-semibold mb-1">
                  {category.name}
                </h3>
                <p className="text-justreal-gray-light text-sm">
                  {category.percentage}% dari total
                </p>
                <Badge 
                  className="mt-2" 
                  style={{ backgroundColor: category.color, color: 'white' }}
                >
                  {category.value} komentar
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-justreal-black rounded-lg border border-justreal-gray">
            <h4 className="text-justreal-white font-semibold mb-3">Insight Analisis:</h4>
            <div className="space-y-2 text-justreal-gray-light text-sm">
              <p>• Total komentar dianalisis: <span className="text-justreal-white font-semibold">{results.length}</span></p>
              <p>• Kategori dominan: <span className="text-justreal-white font-semibold">
                {categoryData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name}
              </span></p>
              <p>• Tingkat komentar positif: <span className="text-justreal-white font-semibold">
                {categoryData.find(c => c.name === 'NETRAL POSITIF')?.percentage}%
              </span></p>
              <p>• Komentar yang memerlukan moderasi: <span className="text-justreal-white font-semibold">
                {((results.length - (categoryData.find(c => c.name === 'NETRAL POSITIF')?.value || 0)) / results.length * 100).toFixed(1)}%
              </span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;
