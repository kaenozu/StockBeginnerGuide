import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TRADABLE_STOCKS } from './constants';

export default function App() {
  const [selectedStock, setSelectedStock] = useState(TRADABLE_STOCKS[0]);
  const [chartData, setChartData] = useState<{name: string, price: number}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStockData = async (ticker: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/stock/${ticker}`);
      const data = await response.json();
      if (data["Time Series (Daily)"]) {
        const timeSeries = data["Time Series (Daily)"];
        const formattedData = Object.keys(timeSeries).slice(0, 20).reverse().map(date => ({
          name: date,
          price: parseFloat(timeSeries[date]["4. close"])
        }));
        setChartData(formattedData);
      } else {
        setError('データの取得に失敗しました。API制限の可能性があります。');
      }
    } catch (err) {
      setError('データの取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(selectedStock.ticker);
  }, [selectedStock]);

  const handleStockSelect = (stock: typeof TRADABLE_STOCKS[0]) => {
    setSelectedStock(stock);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">StockBeginnerGuide</h1>
      <p className="mt-2 text-gray-600">
        銘柄を選択してリアルタイムの株価チャートを確認できます。
      </p>
      
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

      {loading && <p className="mt-4">読み込み中...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {!loading && !error && selectedStock && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-bold text-lg">{selectedStock.name} ({selectedStock.ticker}) のリアルタイム株価チャート:</h2>
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
      )}
    </div>
  );
}
