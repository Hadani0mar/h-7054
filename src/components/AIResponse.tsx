
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check, Sparkles, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeBlock {
  language?: string;
  code: string;
}

interface AIResponseProps {
  response: string;
  processedResponse?: {
    text: string;
    code_blocks: string[];
  };
}

const AIResponse = ({ response, processedResponse }: AIResponseProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [activeTab, setActiveTab] = useState<string>("response");
  
  useEffect(() => {
    setIsVisible(true);
    
    // إذا كان هناك أكواد، قم بمعالجتها
    if (processedResponse?.code_blocks && processedResponse.code_blocks.length > 0) {
      const blocks = processedResponse.code_blocks.map(block => {
        // محاولة استخراج لغة البرمجة من الكود إن وجدت
        const langMatch = block.match(/^(\w+)\s/);
        const language = langMatch ? langMatch[1] : undefined;
        return { language, code: block.trim() };
      });
      setCodeBlocks(blocks);
    } else {
      // محاولة استخراج أكواد من النص الكامل في حالة عدم معالجة الاستجابة
      const regex = /```(\w+)?\s*\n([\s\S]*?)```/g;
      const blocks: CodeBlock[] = [];
      let match;
      
      while ((match = regex.exec(response)) !== null) {
        blocks.push({
          language: match[1],
          code: match[2].trim()
        });
      }
      
      setCodeBlocks(blocks);
    }
  }, [response, processedResponse]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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
            onClick={() => handleCopy(response)}
          >
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="mr-2 text-xs">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
          </Button>
        </div>
        
        {codeBlocks.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-2 border-b border-gray-700">
              <TabsList className="bg-gray-700/30">
                <TabsTrigger value="response" className="data-[state=active]:bg-green-500/20">
                  النص
                </TabsTrigger>
                <TabsTrigger value="code" className="data-[state=active]:bg-blue-500/20">
                  <Code className="h-4 w-4 mr-1" />
                  الأكواد ({codeBlocks.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="response" className="m-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="whitespace-pre-wrap bg-gray-800/50 p-5 rounded-md text-white max-h-[60vh] overflow-y-auto" 
                dir="rtl"
              >
                {processedResponse?.text || response}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="code" className="m-0">
              <div className="bg-gray-800/50 p-5 max-h-[60vh] overflow-y-auto">
                {codeBlocks.map((block, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      {block.language && (
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                          {block.language}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white hover:bg-gray-700"
                        onClick={() => handleCopy(block.code)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        نسخ
                      </Button>
                    </div>
                    <pre className="bg-gray-900/70 p-4 rounded text-gray-100 overflow-x-auto text-sm">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="whitespace-pre-wrap bg-gray-800/50 p-5 rounded-md text-white max-h-[60vh] overflow-y-auto" 
            dir="rtl"
          >
            {response}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default AIResponse;
