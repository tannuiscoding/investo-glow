
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Bitcoin, Send, TrendingUp, ExternalLink, Newspaper } from 'lucide-react';
import { format} from 'date-fns';
import { useQuery } from '@tanstack/react-query';

// Types for our price data
interface PriceData {
  date: string;
  price: number;
}

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
}

const cryptoOptions: CryptoOption[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' },
];

// Function to fetch price data from CoinGecko
const fetchPriceData = async (cryptoId: string): Promise<PriceData[]> => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart/range?vs_currency=usd&from=${Math.floor(startDate.getTime() / 1000)}&to=${Math.floor(endDate.getTime() / 1000)}`,
    {
      headers: {
        'Accept': 'application/json',
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    date: format(new Date(timestamp), 'MM/dd'),
    price: parseFloat(price.toFixed(2))
  }));
};

// Latest market updates - Static fallback data
const marketUpdates = [
  {
    id: 1,
    title: "Bitcoin Surpasses $45,000 Mark",
    description: "BTC breaks key resistance level amid increased institutional interest",
    type: "price",
  },
  {
    id: 2,
    title: "Ethereum Network Upgrade",
    description: "ETH 2.0 staking surpasses $30B in total value locked",
    type: "technology",
  },
  {
    id: 3,
    title: "Global Crypto Regulations",
    description: "New regulatory framework announced for digital assets",
    type: "regulation",
  },
  {
    id: 4,
    title: "DeFi Market Growth",
    description: "Total value locked in DeFi protocols reaches new ATH",
    type: "defi",
  },
];

const Index = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<string>(cryptoOptions[0].id);

  const { data: priceData, isLoading: isPriceLoading } = useQuery({
    queryKey: ['cryptoPrice', selectedCrypto],
    queryFn: () => fetchPriceData(selectedCrypto),
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient animate-fade-in">
          Your Gateway to Smart Investing
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Track real-time crypto prices, analyze market trends, and make informed investment decisions.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="hover-effect">
              Start Trading
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline" className="hover-effect">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Price Chart Card */}
        <Card className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Price Chart (30 Days)</h2>
            <Select
              value={selectedCrypto}
              onValueChange={setSelectedCrypto}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cryptoOptions.map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    {crypto.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-[300px]">
            {isPriceLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#1a1f2c', border: 'none' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#9b87f5" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Market Updates Card */}
        <Card className="glass-panel p-6">
          <h3 className="text-2xl font-semibold mb-6">Market Updates</h3>
          <div className="space-y-6">
            {marketUpdates.map((update) => (
              <div key={update.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <h4 className="font-medium mb-1">{update.title}</h4>
                <p className="text-sm text-muted-foreground">{update.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="glass-panel text-center p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4">Start Your Investment Journey Today</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of investors making smarter decisions with InvestoGlow
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button className="hover-effect" size="lg">
              Get Started
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Index;
