import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStockRecommendation, analyzeStock, analyzeSellTiming, StockAnalysis } from './services/geminiService';
import { TRADABLE_STOCKS } from './constants';

// モックデータ生成
const generateMockChartData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    name: `Day ${i + 1}`,
    price: Math.floor(Math.random() * 1000) + 2000,
  }));
};

const ScoreMeter = ({ score }: { score: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
    <div
      className={`h-4 rounded-full ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
      style={{ width: `${score}%` }}
    />
  </div>
);

export default function App() {
  const [recommendations, setRecommendations] = useState<StockAnalysis[]>([]);
  const [selectedStock, setSelectedStock] = useState(TRADABLE_STOCKS[0]);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [sellTiming, setSellTiming] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(generateMockChartData());

  const handleGetRecommendation = async () => {
    setLoading(true);
    setError('');
    setRecommendations([]);
    try {
      const result = await getStockRecommendation();
      setRecommendations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '推奨銘柄の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStockSelect = async (stock: typeof TRADABLE_STOCKS[0]) => {
    setSelectedStock(stock);
    setLoading(true);
    setError('');
    setAnalysis(null);
    setSellTiming(null);
    setChartData(generateMockChartData());
    try {
      const result = await analyzeStock(stock.name);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSellTiming = async () => {
    setLoading(true);
    setError('');
    setSellTiming(null);
    try {
      const result = await analyzeSellTiming(selectedStock.ticker);
      setSellTiming(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '売却タイミングの分析に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">StockBeginnerGuide</h1>
      <p className="mt-2 text-gray-600">
        AIがトレード向きの銘柄から、今買うべき銘柄を選定します。
      </p>
      
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h2 className="font-bold text-yellow-800">免責事項</h2>
        <p className="text-sm text-yellow-700">
          本アプリは投資の学習およびシミュレーションを目的としています。
          AIが提示する推奨銘柄やチャートは利益を保証するものではありません。
          実際の投資は自己責任で行ってください。
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold">銘柄一覧から選択:</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {TRADABLE_STOCKS.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => handleStockSelect(stock)}
              className={`p-2 rounded border ${selectedStock.ticker === stock.ticker ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              {stock.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGetRecommendation}
          disabled={loading}
          className="bg-green-500 text-white p-2 rounded w-full"
        >
          {loading ? '選定中...' : '今買うべき銘柄をAIに聞く'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      {recommendations.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-bold text-lg">AI推奨銘柄一覧:</h2>
          {recommendations.map((rec) => (
            <div key={rec.ticker} className="p-4 border rounded bg-blue-50">
              <h3 className="font-bold text-lg">{rec.name} ({rec.ticker})</h3>
              <p className="text-sm text-gray-600">トレンド: {rec.trend}</p>
              <ScoreMeter score={rec.score} />
              <p className="mt-2">{rec.summary}</p>
            </div>
          ))}
        </div>
      )}

      {selectedStock && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded">
            <h2 className="font-bold text-lg">{selectedStock.name} ({selectedStock.ticker}) の分析:</h2>
            {analysis ? (
              <>
                <p className="text-sm text-gray-600">トレンド: {analysis.trend}</p>
                <ScoreMeter score={analysis.score} />
                <p className="mt-2">{analysis.summary}</p>
                <button
                  onClick={handleSellTiming}
                  disabled={loading}
                  className="mt-4 bg-red-500 text-white p-2 rounded w-full"
                >
                  {loading ? '分析中...' : '売却タイミングをAIに聞く'}
                </button>
              </>
            ) : (
              <p className="mt-2">分析中...</p>
            )}
            
            {sellTiming && (
              <div className="mt-4 p-4 border rounded bg-red-50">
                <h3 className="font-bold text-lg">売却タイミングの分析:</h3>
                <p className="text-sm text-gray-600">トレンド: {sellTiming.trend}</p>
                <ScoreMeter score={sellTiming.score} />
                <p className="mt-2">{sellTiming.summary}</p>
              </div>
            )}
          </div>
          <div className="p-4 border rounded">
            <h2 className="font-bold text-lg">株価チャート (シミュレーション):</h2>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
