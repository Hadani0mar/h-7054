
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Sparkles, Brain, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AIResponse from '@/components/AIResponse';
import { fetchAIResponse } from '@/lib/aiService';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // استرجاع التاريخ من التخزين المحلي
    const savedHistory = localStorage.getItem('promptHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
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
    
    try {
      // إضافة الطلب إلى التاريخ
      const newHistory = [...history, prompt];
      setHistory(newHistory);
      localStorage.setItem('promptHistory', JSON.stringify(newHistory));
      
      const result = await fetchAIResponse(prompt);
      setResponse(result);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <header className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-3">
              <div className="relative">
                <Brain className="h-16 w-16 text-green-400" />
                <motion.div
                  className="absolute top-0 left-0 right-0 bottom-0"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 2,
                  }}
                >
                  <Sparkles className="h-16 w-16 text-green-500 opacity-50" />
                </motion.div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              نظام الذكاء الاصطناعي بايثون
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-gray-300"
          >
            أرسل طلبك وسأقوم بمعالجته والإجابة عليه
          </motion.p>
        </header>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700"
        >
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4 relative">
              <Textarea
                placeholder="اكتب سؤالك أو طلبك هنا..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`min-h-[120px] bg-gray-700 border border-gray-600 focus:border-green-500 text-white placeholder:text-gray-400 shadow-inner transition-all duration-200 ${isTyping ? 'border-green-500' : ''}`}
                dir="rtl"
              />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isTyping ? 1 : 0 }}
                className="absolute bottom-2 left-2 text-green-500 text-xs"
              >
                جاري الكتابة...
              </motion.div>
            </div>
            
            {history.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">الطلبات السابقة:</p>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="text-red-400 hover:text-red-300 p-1"
                  onClick={clearHistory}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  مسح التاريخ
                </Button>
              </div>
            )}
            
            {history.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {history.slice(-3).map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      type="button"
                      variant="secondary" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.length > 25 ? item.substring(0, 25) + '...' : item}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">اقتراحات للبدء:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex-grow"
                  >
                    <Button 
                      type="button"
                      variant="outline" 
                      className="text-xs w-full text-gray-300 border-gray-600 hover:bg-gray-700"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3"
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
          
          {response && <AIResponse response={response} />}
        </motion.div>
        
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>تم تطويره باستخدام Python و React</p>
          <div className="flex justify-center items-center mt-2 space-x-2 rtl:space-x-reverse">
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                delay: 0.2
              }}
            >
              <span className="text-green-500 text-2xl">•</span>
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                delay: 0.4
              }}
            >
              <span className="text-blue-500 text-2xl">•</span>
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                delay: 0.6
              }}
            >
              <span className="text-purple-500 text-2xl">•</span>
            </motion.div>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Index;
