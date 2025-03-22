
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowUpRight, Command, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConversationItem {
  question: string;
  answer: string;
  details?: string;
}

interface ConversationHistoryProps {
  history: ConversationItem[];
  onSelectQuestion: (question: string) => void;
  loadingState: boolean;
}

const ConversationHistory = ({ history, onSelectQuestion, loadingState }: ConversationHistoryProps) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">المحادثات السابقة:</h3>
      <ScrollArea className="h-20">
        <div className="flex flex-wrap gap-2">
          {history.slice(0, 5).map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      disabled={loadingState}
                      className="text-xs bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      onClick={() => onSelectQuestion(item.question)}
                    >
                      <span className="truncate max-w-[200px]">
                        {item.question}
                      </span>
                      {item.details && <Info className="h-3 w-3 mx-1 text-blue-500" />}
                      <ArrowUpRight className="h-3 w-3 ml-1 text-slate-500 dark:text-slate-400" />
                    </Button>
                  </TooltipTrigger>
                  {item.details && (
                    <TooltipContent side="bottom">
                      <p className="text-xs max-w-[200px]">{item.details}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationHistory;
