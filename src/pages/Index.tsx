
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bot, Trash2, RefreshCw, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import AIResponse from '@/components/AIResponse';
import UserIdCreator from '@/components/UserIdCreator';
import ConversationHistory from '@/components/ConversationHistory';
import QuestionInput from '@/components/QuestionInput';
import { fetchAIResponse, fetchConversationHistory, clearUserSession } from '@/lib/aiService';
import { Button } from '@/components/ui/button';

interface ConversationItem {
  question: string;
  answer: string;
  details?: string;
}

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [details, setDetails] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ConversationItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { toast } = useToast();

  // جلب محادثات المستخدم السابقة عند تحميل الصفحة
  useEffect(() => {
    const loadConversationHistory = async () => {
      setIsFetchingHistory(true);
      try {
        const conversations = await fetchConversationHistory();
        setHistory(conversations);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      } finally {
        setIsFetchingHistory(false);
      }
    };
    
    if (localStorage.getItem('bn0mar_user_id')) {
      loadConversationHistory();
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
    setDetails(undefined);
    
    try {
      // حفظ السؤال الحالي لعرضه أثناء معالجة الطلب
      const currentQuestion = prompt;
      
      const result = await fetchAIResponse(prompt);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setResponse(result.response);
      
      // تحديث التاريخ محليًا (سيتم تحديث التاريخ الفعلي من الخادم عند إعادة التحميل)
      await refreshHistory();
      
      // مسح مربع النص بعد الإرسال
      setPrompt('');
      
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

  const refreshHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const conversations = await fetchConversationHistory();
      setHistory(conversations);
      return conversations;
    } catch (error) {
      console.error('Failed to refresh conversation history:', error);
      toast({
        title: "خطأ",
        description: "فشل تحديث سجل المحادثات",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const clearHistory = () => {
    // مسح جلسة المستخدم من التخزين المحلي
    clearUserSession();
    setHistory([]);
    setResponse('');
    setDetails(undefined);
    toast({
      title: "تم مسح التاريخ",
      description: "تم مسح جميع المحادثات السابقة وإنشاء جلسة جديدة",
    });
  };

  const handleNewUserCreated = (userId: string) => {
    // مسح التاريخ والاستجابة عند إنشاء مستخدم جديد
    setHistory([]);
    setResponse('');
    setDetails(undefined);
  };

  const suggestions = [
    "شن يدير مصمم واجهات المستخدم؟",
    "اكتبلي برنامج بايثون يحسب مجموع الأرقام من 1 إلى 100",
    "علمني كيفية نكتب قصة قصيرة باللهجة الليبية"
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
        className="ai-container py-8 md:py-12 max-w-4xl mx-auto px-4"
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
            Bn0mar-ai
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto"
          >
            اسأل أي سؤال وسأجيبك باللهجة الليبية
          </motion.p>
          
          {localStorage.getItem('bn0mar_user_id') && (
            <motion.div
              variants={itemVariants}
              className="mt-2"
            >
              <span className="text-xs bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 inline-flex items-center">
                <Command className="h-3 w-3 mr-1" />
                معرف المستخدم: {localStorage.getItem('bn0mar_user_id')?.substring(0, 8)}...
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
              {!localStorage.getItem('bn0mar_user_id') && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm mb-3">
                    لم يتم إنشاء معرف مستخدم بعد. يرجى إنشاء معرف مستخدم للبدء.
                  </p>
                  <UserIdCreator 
                    onNewUserCreated={handleNewUserCreated} 
                    isCreatingUser={isCreatingUser}
                    setIsCreatingUser={setIsCreatingUser}
                  />
                </div>
              )}
              
              <QuestionInput 
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isTyping={isTyping}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 order-1 sm:order-2 w-full sm:w-auto">
                  {isFetchingHistory ? (
                    <span className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      جاري التحميل...
                    </span>
                  ) : (
                    <>
                      {history.length > 0 && (
                        <div className="flex gap-2 items-center w-full justify-between sm:justify-start">
                          <span className="whitespace-nowrap">لديك {history.length} محادثة سابقة</span>
                          <div className="flex gap-2">
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                              onClick={() => refreshHistory()}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              تحديث
                            </Button>
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                              onClick={clearHistory}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              مسح
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {!isCreatingUser && localStorage.getItem('bn0mar_user_id') && (
                  <div className="order-2 sm:order-1 w-full sm:w-auto">
                    <UserIdCreator 
                      onNewUserCreated={handleNewUserCreated} 
                      isCreatingUser={isCreatingUser}
                      setIsCreatingUser={setIsCreatingUser}
                    />
                  </div>
                )}
              </div>
              
              <ConversationHistory 
                history={history} 
                onSelectQuestion={handleSuggestionClick}
                loadingState={isLoading}
              />
              
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
            <AIResponse response={response} details={details} />
          </motion.div>
        )}
        
        <motion.footer 
          variants={itemVariants}
          className="mt-10 text-center text-slate-500 dark:text-slate-500 text-sm"
        >
          <p className="mb-2">M0usaBn0mar 2024</p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Index;
