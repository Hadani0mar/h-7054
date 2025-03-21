
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Send, 
  Sparkles, 
  Brain, 
  Trash2, 
  CornerDownLeft, 
  ArrowUpRight, 
  Command,
  Database,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import AIResponse from '@/components/AIResponse';
import { fetchAIResponse, fetchAvailableModels } from '@/lib/aiService';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [processedResponse, setProcessedResponse] = useState<{text: string, code_blocks: string[]} | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
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
    
    // جلب النماذج المتاحة
    fetchModels();
  }, []);
  
  const fetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const modelData = await fetchAvailableModels();
      if (modelData && modelData.models) {
        setModels(modelData.models);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: "خطأ في جلب النماذج",
        description: "حدث خطأ أثناء محاولة جلب النماذج المتاحة",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModels(false);
    }
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
    setProcessedResponse(undefined);
    
    try {
      // إضافة الطلب إلى التاريخ
      const newHistory = [...history, prompt];
      setHistory(newHistory);
      localStorage.setItem('promptHistory', JSON.stringify(newHistory));
      
      const options = {
        sessionId,
        model: selectedModel
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto px-4 py-8 md:py-12"
      >
        <motion.header 
          variants={itemVariants} 
          className="mb-8 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="relative inline-block">
              <div className="bg-gradient-to-r from-green-600/30 to-blue-600/30 p-4 rounded-full">
                <Brain className="h-16 w-16 text-green-400" />
              </div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3,
                }}
              >
                <Sparkles className="h-24 w-24 text-blue-500/30" />
              </motion.div>
            </div>
          </div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
          >
            نظام الذكاء الاصطناعي بايثون
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-300 max-w-xl mx-auto"
          >
            أرسل طلبك وسأقوم بمعالجته والإجابة عليه بدقة وكفاءة عالية
          </motion.p>
          
          {sessionId && (
            <motion.div
              variants={itemVariants}
              className="mt-2"
            >
              <span className="text-xs bg-gray-800 px-3 py-1 rounded-full border border-gray-700 text-green-400 inline-flex items-center">
                <Database className="h-3 w-3 mr-1" />
                محادثة مستمرة
              </span>
            </motion.div>
          )}
        </motion.header>
        
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4">
                  <div className="col-span-1 md:col-span-3">
                    <label htmlFor="model-select" className="text-sm text-gray-400 mb-1 block">النموذج:</label>
                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                      disabled={isLoadingModels}
                    >
                      <SelectTrigger className="bg-gray-700/70 border-gray-600 focus:border-green-500 text-white">
                        <SelectValue placeholder="اختر نموذجًا" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectGroup>
                          <SelectLabel className="text-gray-400">النماذج المتاحة</SelectLabel>
                          {isLoadingModels ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              <span className="mr-2 text-gray-400 text-sm">جاري تحميل النماذج...</span>
                            </div>
                          ) : models.length > 0 ? (
                            models.map((model) => (
                              <SelectItem key={model} value={model} className="text-white hover:bg-gray-700">
                                <div className="flex items-center">
                                  <Cpu className="h-3 w-3 mr-2 text-green-500" />
                                  {model}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="gpt-3.5-turbo" className="text-white">
                              <div className="flex items-center">
                                <Cpu className="h-3 w-3 mr-2 text-green-500" />
                                gpt-3.5-turbo (الافتراضي)
                              </div>
                            </SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-1">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:text-green-400 hover:border-green-500"
                      onClick={fetchModels}
                      disabled={isLoadingModels}
                    >
                      {isLoadingModels ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span>تحديث النماذج</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Textarea
                    placeholder="اكتب سؤالك أو طلبك هنا..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] bg-gray-700/70 border border-gray-600 focus:border-green-500 text-white placeholder:text-gray-400 resize-none shadow-inner transition-all duration-200 text-lg"
                    dir="rtl"
                  />
                  
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-gray-500">
                    {isTyping ? (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-green-500 text-xs flex items-center"
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
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
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
                    <div className="flex items-center gap-2 text-sm text-gray-400 order-1 sm:order-2">
                      <span>لديك {history.length} طلب سابق</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
                  <h3 className="text-sm font-medium text-gray-400 mb-3">الطلبات السابقة:</h3>
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
                            className="text-xs bg-gray-700/50 border-gray-600 hover:bg-gray-600 text-gray-300"
                            onClick={() => handleSuggestionClick(item)}
                          >
                            <span className="truncate max-w-[200px]">
                              {item}
                            </span>
                            <ArrowUpRight className="h-3 w-3 ml-1 text-gray-500" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">اقتراحات للبدء:</h3>
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
                        className="w-full h-auto py-3 text-xs text-gray-300 border-gray-600 bg-gray-800/30 hover:bg-gray-700/50 justify-start"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Command className="h-3 w-3 mr-2 text-green-500" />
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
          className="mt-10 text-center text-gray-500 text-sm"
        >
          <p className="mb-2">تم تطويره باستخدام Python و React</p>
          <div className="flex justify-center items-center space-x-3 rtl:space-x-reverse">
            {[
              { color: "green", delay: 0.2 },
              { color: "blue", delay: 0.4 },
              { color: "purple", delay: 0.6 }
            ].map((item, index) => (
              <motion.div
                key={index}
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1.5,
                  delay: item.delay
                }}
              >
                <span className={`text-${item.color}-500 text-lg`}>•</span>
              </motion.div>
            ))}
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Index;
