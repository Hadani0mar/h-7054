
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AIResponse from '@/components/AIResponse';
import { fetchAIResponse } from '@/lib/aiService';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    
    try {
      const result = await fetchAIResponse(prompt);
      setResponse(result);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء الاتصال بالخادم. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">نظام الذكاء الاصطناعي بايثون</h1>
          <p className="text-lg text-gray-400">أرسل طلبك وسأقوم بمعالجته والإجابة عليه</p>
        </header>
        
        <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <Textarea
                placeholder="اكتب سؤالك أو طلبك هنا..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                dir="rtl"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : "إرسال الطلب"}
            </Button>
          </form>
          
          {response && <AIResponse response={response} />}
        </div>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>تم تطويره باستخدام Python و React</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
