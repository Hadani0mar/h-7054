
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Send, Loader2, CornerDownLeft, Command } from 'lucide-react';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isTyping: boolean;
}

const QuestionInput = ({ value, onChange, onSubmit, isLoading, isTyping }: QuestionInputProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="relative">
        <Textarea
          placeholder="اكتب سؤالك أو طلبك هنا..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none shadow-inner transition-all duration-200 text-lg"
          dir="rtl"
        />
        
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-slate-500 dark:text-slate-400">
          {isTyping ? (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-500 dark:text-slate-400 text-xs flex items-center"
            >
              <Command className="h-3 w-3 mr-1" />
              جاري الكتابة...
            </motion.span>
          ) : (
            <span className="text-xs flex items-center">
              <CornerDownLeft className="h-3 w-3 mr-1" />
              اضغط Enter للإرسال
            </span>
          )}
        </div>
      </div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto"
      >
        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              إرسال الطلب
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
};

export default QuestionInput;
