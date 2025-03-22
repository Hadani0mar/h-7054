
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AIResponseProps {
  response: string;
  details?: string;
}

const AIResponse = ({ response, details }: AIResponseProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full">
              <Bot className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">استجابة النظام</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => handleCopy(response)}
          >
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="mr-2 text-xs">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
          </Button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="whitespace-pre-wrap bg-white dark:bg-slate-800 p-5 rounded-md text-slate-800 dark:text-slate-200 max-h-[60vh] overflow-y-auto" 
          dir="rtl"
        >
          {response}
          
          {details && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
              <h4 className="font-medium mb-2">تفاصيل إضافية:</h4>
              <p>{details}</p>
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default AIResponse;
