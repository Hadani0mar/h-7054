
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Send, 
  Bot, 
  Trash2, 
  CornerDownLeft, 
  ArrowUpRight, 
  Command,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AIResponse from '@/components/AIResponse';
import { fetchAIResponse } from '@/lib/aiService';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [processedResponse, setProcessedResponse] = useState<{text: string, code_blocks: string[]} | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // استرجاع التاريخ من التخزين المحلي
    const savedHistory = localStorage.getItem('promptHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    // استرجاع معرف الجلسة من التخزين المحلي
    const savedSessionId = localStorage.getItem('sessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال سؤال أو طلب",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    setProcessedResponse(undefined);
    
    try {
      // إضافة الطلب إلى التاريخ
      const newHistory = [...history, prompt];
      setHistory(newHistory);
      localStorage.setItem('promptHistory', JSON.stringify(newHistory));
      
      const options = {
        sessionId
      };
      
      const result = await fetchAIResponse(prompt, options);
      
      if (result.session_id) {
        setSessionId(result.session_id);
        localStorage.setItem('sessionId', result.session_id);
      }
      
      if (result.processed) {
        setProcessedResponse(result.processed);
      }
      
      setResponse(result.response);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء الاتصال بالخادم. الرجاء التحقق من تنسيق الطلب أو المحاولة مرة أخرى لاحقًا.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 500);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('promptHistory');
    toast({
      title: "تم مسح التاريخ",
      description: "تم مسح جميع الطلبات السابقة بنجاح",
    });
  };

  const suggestions = [
    "اكتب برنامج بايثون لحساب مجموع الأرقام من 1 إلى 100",
    "كيف يمكنني إنشاء خوارزمية تصنيف الصور؟",
    "اشرح كيفية استخدام مكتبة pandas في بايثون"
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="ai-container py-8 md:py-12"
      >
        <motion.header 
          variants={itemVariants} 
          className="mb-8 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="relative inline-block">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                <Bot className="h-12 w-12 text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          </div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-3 ai-gradient-text"
          >
            نظام الذكاء الاصطناعي بايثون
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto"
          >
            أرسل طلبك وسأقوم بمعالجته والإجابة عليه بدقة وكفاءة عالية
          </motion.p>
          
          {sessionId && (
            <motion.div
              variants={itemVariants}
              className="mt-2"
            >
              <span className="text-xs bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 inline-flex items-center">
                <Command className="h-3 w-3 mr-1" />
                محادثة مستمرة
              </span>
            </motion.div>
          )}
        </motion.header>
        
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <Card className="ai-subtle-card">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Textarea
                    placeholder="اكتب سؤالك أو طلبك هنا..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
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
                
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto order-2 sm:order-1"
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
                  
                  {history.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 order-1 sm:order-2">
                      <span>لديك {history.length} طلب سابق</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        onClick={clearHistory}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        مسح التاريخ
                      </Button>
                    </div>
                  )}
                </div>
              </form>
              
              {history.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">الطلبات السابقة:</h3>
                  <ScrollArea className="h-20">
                    <div className="flex flex-wrap gap-2">
                      {history.slice(-5).map((item, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            className="text-xs bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            onClick={() => handleSuggestionClick(item)}
                          >
                            <span className="truncate max-w-[200px]">
                              {item}
                            </span>
                            <ArrowUpRight className="h-3 w-3 ml-1 text-slate-500 dark:text-slate-400" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">اقتراحات للبدء:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * index, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className="w-full"
                    >
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full h-auto py-3 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 justify-start"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Command className="h-3 w-3 mr-2" />
                        <span className="truncate">{suggestion}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AIResponse response={response} processedResponse={processedResponse} />
          </motion.div>
        )}
        
        <motion.footer 
          variants={itemVariants}
          className="mt-10 text-center text-slate-500 dark:text-slate-500 text-sm"
        >
          <p className="mb-2">تم تطويره باستخدام Python و React</p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Index;
