import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEurPrice } from '@/lib/conversion';

interface SavingsAnimationProps {
  currentAmount: number;
  targetAmount: number;
  className?: string;
}

export default function SavingsAnimation({ 
  currentAmount, 
  targetAmount, 
  className = "" 
}: SavingsAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [previousAmount, setPreviousAmount] = useState(currentAmount);
  const [coins, setCoins] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  
  // Calculate progress percentage
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  
  // Trigger animation when current amount changes
  useEffect(() => {
    if (currentAmount > previousAmount) {
      // Generate random coins for animation
      const newCoins = [];
      const coinCount = Math.min(10, Math.ceil((currentAmount - previousAmount) / 100));
      
      for (let i = 0; i < coinCount; i++) {
        newCoins.push({
          id: Date.now() + i,
          x: Math.random() * 80 + 10, // Random position 10-90%
          delay: Math.random() * 0.5 // Random delay 0-0.5s
        });
      }
      
      setCoins(newCoins);
      setShowAnimation(true);
      
      // Hide animation after it completes
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    setPreviousAmount(currentAmount);
  }, [currentAmount, previousAmount]);
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Car image and savings visualization */}
      <div className="relative h-60 bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
        {/* Target amount marker */}
        <div className="absolute top-1 right-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold z-10">
          Target: {formatEurPrice(targetAmount)}
        </div>
        
        {/* Car image */}
        <motion.div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          initial={{ y: 50 }}
          animate={{ 
            y: progress >= 100 ? 0 : Math.max(20 - (progress / 5), 0)
          }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,40 L20,30 C20,15 35,15 60,15 C85,15 100,15 100,30 L100,40" stroke="#333" strokeWidth="2" fill="#f5f5f5" />
            <rect x="15" y="40" width="90" height="15" rx="2" fill="#3b82f6" />
            <circle cx="30" cy="55" r="6" fill="#333" />
            <circle cx="90" cy="55" r="6" fill="#333" />
            <rect x="30" y="20" width="20" height="10" rx="2" fill="#eee" />
            <rect x="70" y="20" width="20" height="10" rx="2" fill="#eee" />
          </svg>
        </motion.div>
        
        {/* Water/savings level */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-blue-400/70"
          initial={{ height: `${Math.max((previousAmount / targetAmount) * 100, 0)}%` }}
          animate={{ height: `${Math.max((currentAmount / targetAmount) * 100, 0)}%` }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="absolute top-0 left-0 right-0 h-3 bg-blue-300/50 animate-pulse"></div>
        </motion.div>
        
        {/* Coins animation */}
        <AnimatePresence>
          {showAnimation && coins.map(coin => (
            <motion.div
              key={coin.id}
              className="absolute bottom-full z-10"
              style={{ left: `${coin.x}%` }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 100, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5,
                delay: coin.delay, 
                ease: "easeOut" 
              }}
            >
              <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-500 flex items-center justify-center text-yellow-800 font-bold text-xs shadow-md">
                €
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Current amount */}
      <div className="bg-white p-3 text-center border-t">
        <motion.div
          key={currentAmount}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm text-gray-500">Current Savings</div>
          <div className="text-xl font-bold text-blue-600">{formatEurPrice(currentAmount)}</div>
          <div className="text-xs text-gray-400 mt-1">
            {progress < 100 
              ? `${progress.toFixed(1)}% of target` 
              : '🎉 Target reached! 🎉'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}