
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIResponseProps {
  response: string;
}

const AIResponse = ({ response }: AIResponseProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-5 border border-gray-700 shadow-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-green-600 p-2 rounded-full mr-3">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-green-400">استجابة النظام</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-white"
          onClick={handleCopy}
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="mr-2 text-xs">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
        </Button>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="whitespace-pre-wrap bg-gray-900 p-4 rounded-md border border-gray-800 text-white shadow-inner" 
        dir="rtl"
      >
        {response}
      </motion.div>
    </motion.div>
  );
};

export default AIResponse;
