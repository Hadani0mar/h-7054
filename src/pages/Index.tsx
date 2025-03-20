
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Sparkles, Brain, Trash2, Save, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AIResponse from '@/components/AIResponse';
import { fetchAIResponse, fetchAvailableModels } from '@/lib/aiService';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [availableModels, setAvailableModels] = useState<string[]>(["gpt-4"]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const { toast } = useToast();

  // استرجاع التاريخ والنموذج المختار من التخزين المحلي
  useEffect(() => {
    const savedHistory = localStorage.getItem('promptHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    
    // جلب النماذج المتاحة
    loadAvailableModels();
  }, []);

  // جلب النماذج المتاحة من الخادم
  const loadAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await fetchAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
      toast({
        title: "تعذر تحميل النماذج",
        description: "حدث خطأ أثناء محاولة تحميل النماذج المتاحة.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  // حفظ النموذج المختار
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem('selectedModel', model);
    toast({
      title: "تم تغيير النموذج",
      description: `تم تعيين النموذج إلى ${model}`,
    });
  };

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
      
      const result = await fetchAIResponse(prompt, selectedModel);
      setResponse(result);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء الاتصال بالخادم. الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى لاحقًا.",
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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto p-4 md:p-8"
      >
        <motion.header 
          variants={itemVariants}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-4"
          >
            <div className="relative flex justify-center mb-3">
              <Brain className="h-20 w-20 text-green-400" />
              <motion.div
                className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3,
                }}
              >
                <Sparkles className="h-24 w-24 text-green-500 opacity-60" />
              </motion.div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              نظام الذكاء الاصطناعي
            </h1>
            <div className="text-lg text-gray-300 mt-2">
              تم تطويره بواسطة <span className="font-semibold text-blue-400">Bn0mar</span>
            </div>
          </motion.div>
        </motion.header>
        
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl p-6 border border-gray-700"
        >
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-5">
              <label className="block text-gray-300 mb-2 text-right">اختر نموذج الذكاء الاصطناعي:</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={loadAvailableModels}
                  disabled={isLoadingModels}
                  className="text-gray-400 hover:text-white"
                >
                  {isLoadingModels ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Select
                  value={selectedModel}
                  onValueChange={handleModelChange}
                  disabled={isLoadingModels}
                >
                  <SelectTrigger className="flex-1 bg-gray-800 border-gray-600">
                    <SelectValue placeholder="اختر نموذجًا" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-4 relative">
              <Textarea
                placeholder="اكتب سؤالك أو طلبك هنا..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`min-h-[120px] bg-gray-800 border border-gray-600 focus:border-green-500 text-white placeholder:text-gray-400 shadow-inner transition-all duration-200 ${isTyping ? 'border-green-500' : ''}`}
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
              <div className="flex flex-wrap gap-2 mb-4 bg-gray-800/50 p-3 rounded-md">
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
                      className="text-xs bg-gray-700 hover:bg-gray-600"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.length > 25 ? item.substring(0, 25) + '...' : item}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2 text-right">اقتراحات للبدء:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Button 
                      type="button"
                      variant="outline" 
                      className="text-xs w-full h-auto py-2 text-gray-300 border-gray-600 hover:bg-gray-700 text-right"
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
          variants={itemVariants}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>تم تطويره بواسطة <span className="text-blue-400">Bn0mar</span> باستخدام Python و React</p>
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
