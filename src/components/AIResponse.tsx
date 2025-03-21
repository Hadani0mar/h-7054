
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-green-600/20 p-2 rounded-full">
                <Bot className="h-5 w-5 text-green-400" />
              </div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.3, 0.7],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3,
                }}
              >
                <Sparkles className="h-8 w-8 text-green-500/30" />
              </motion.div>
            </div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">استجابة النظام</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white hover:bg-gray-700"
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
          className="whitespace-pre-wrap bg-gray-800/50 p-5 rounded-md text-white max-h-[60vh] overflow-y-auto" 
          dir="rtl"
        >
          {response}
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default AIResponse;
