import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import useSound from 'use-sound';

const items = [
  { name: 'Mocktail A', basePrice: 50, minPrice: 40, maxPrice: 80 },
  { name: 'Mocktail B', basePrice: 60 },
  { name: 'Mocktail C', basePrice: 70 },
  { name: 'Food Item 1', basePrice: 40 },
  { name: 'Food Item 2', basePrice: 30 }
];

const DynamicPricing = () => {
  const [prices, setPrices] = useState(items.map(item => item.basePrice));
  const [history, setHistory] = useState(items.map(() => []));
  const [priceInfo, setPriceInfo] = useState([]);
  const [cart, setCart] = useState([]);
  const [autoChange, setAutoChange] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const [playIncrease] = useSound('https://www.soundjay.com/button/sounds/button-4.mp3');
  const [playDecrease] = useSound('https://www.soundjay.com/button/sounds/button-10.mp3');
  const [playBuy] = useSound('https://www.soundjay.com/button/sounds/cash-register.mp3');

  useEffect(() => {
    if (!autoChange) return;

    const interval = setInterval(() => {
      setPrices(prevPrices => {
        return prevPrices.map((price, index) => {
          const fluctuation = Math.random() > 0.5 ? 5 : -5;
          let newPrice = price + fluctuation;

          if (items[index].name === 'Mocktail A') {
            newPrice = Math.max(items[index].minPrice, Math.min(newPrice, items[index].maxPrice));
          }

          const previousPrice = price;

          setHistory(prevHistory => {
            const newHistory = [...prevHistory];
            newHistory[index] = [...(newHistory[index] || []), { time: new Date().toLocaleTimeString(), price: newPrice, color: newPrice > previousPrice ? '#00C853' : '#FF0000' }];
            return newHistory;
          });

          setPriceInfo(prevInfo => {
            const updatedInfo = [...prevInfo];
            updatedInfo[index] = {
              itemName: items[index].name,
              price: newPrice,
              direction: newPrice > previousPrice ? '⬆️' : '⬇️',
              color: newPrice > previousPrice ? 'text-green-500' : 'text-red-500'
            };
            return updatedInfo;
          });

          newPrice > previousPrice ? playIncrease() : playDecrease();

          return newPrice;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoChange, playIncrease, playDecrease]);

  const handleBuy = (index) => {
    const item = items[index];
    const currentPrice = prices[index];
    setCart(prevCart => [...prevCart, { name: item.name, price: currentPrice }]);
    playBuy();
  };

  const calculateTotal = () => cart.reduce((total, item) => total + item.price, 0);

  const clearCart = () => {
    setCart([]);
    setShowMessage(false);
  };

  const finishOrder = () => {
    setShowMessage(true);
  };

  const triggerMarketCrash = () => {
    setPrices(prices.map(() => 20));
    setTimeout(() => {
      setAutoChange(true);
    }, 10000); // Resume normal fluctuation after 10 seconds
  };

  return (
    <div className="p-8 space-y-8 bg-gray-200 min-h-screen">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-center text-blue-700 mb-8">
        Mocktail & Food Stock Exchange
      </motion.h1>

      <Button onClick={triggerMarketCrash} className="mb-4 bg-red-600 text-white">Trigger Market Crash</Button>

      <div className="bg-black text-white p-2 text-center overflow-hidden">
        <motion.div
          className="whitespace-nowrap"
          animate={{ x: [2000, -2000] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
        >
          {priceInfo.map((info, index) => (
            <span key={index} className={`mx-4 ${info.color}`}>{info.itemName}: ₹{info.price} {info.direction}</span>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((item, index) => (
          <div key={index} className="p-6 bg-white rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-blue-600">{item.name}</h2>
            <p className={`text-6xl font-bold mt-2 mb-4 ${prices[index] > item.basePrice ? 'text-green-500' : 'text-red-500'}`}>₹{prices[index]}</p>
            <Button onClick={() => handleBuy(index)}>Buy</Button>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={history[index]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="price">
                  {history[index].map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-2xl mt-8">
        <h2 className="text-xl font-bold mb-4">Cart</h2>
        <table className="w-full mb-4">
          <thead>
            <tr><th>Name</th><th>Price</th></tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}><td>{item.name}</td><td>₹{item.price}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="text-3xl font-bold mb-4">Total: ₹{calculateTotal()}</div>
        <Button onClick={clearCart} className="mr-2">Clear Order (New Customer)</Button>
        <Button onClick={finishOrder}>Finish Order</Button>
        {showMessage && <div className="mt-4 text-2xl text-green-600 font-bold">Have a Good Day!</div>}
      </div>
    </div>
  );
};

export default DynamicPricing;
