
interface AIResponseData {
  response: string;
  error?: string;
}

interface AIRequestOptions {
  userId?: string;
}

/**
 * يرسل طلب إلى خدمة الذكاء الاصطناعي ويعيد الاستجابة
 * @param prompt - طلب المستخدم
 * @param options - خيارات إضافية
 * @returns وعد يحتوي على استجابة الذكاء الاصطناعي
 */
export async function fetchAIResponse(prompt: string, options: AIRequestOptions = {}): Promise<AIResponseData> {
  try {
    // استخدام معرف المستخدم من localStorage أو إنشاء واحد جديد
    let userId = options.userId || localStorage.getItem('bn0mar_user_id');
    
    // إذا لم يكن هناك معرف مستخدم، قم بإنشاء واحد جديد
    if (!userId) {
      const response = await fetch('http://localhost:8000/create_user', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`فشل إنشاء معرف المستخدم: ${response.status}`);
      }
      
      const data = await response.json();
      userId = data.user_id;
      localStorage.setItem('bn0mar_user_id', userId);
    }
    
    // إرسال الطلب إلى API الخاص بك
    const response = await fetch('http://localhost:8000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        user_id: userId,
        text: prompt
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // الحصول على البيانات كـ JSON
    const data = await response.json();
    
    return {
      response: data.response
    };
    
  } catch (error) {
    console.error('Error in fetchAIResponse:', error);
    return {
      response: "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
      error: error instanceof Error ? error.message : "خطأ غير معروف"
    };
  }
}

/**
 * يجلب المحادثات السابقة للمستخدم
 * @returns وعد يحتوي على المحادثات السابقة
 */
export async function fetchConversationHistory(): Promise<{question: string; answer: string}[]> {
  try {
    const userId = localStorage.getItem('bn0mar_user_id');
    
    if (!userId) {
      return [];
    }
    
    const response = await fetch(`http://localhost:8000/conversations/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.conversations;
    
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

/**
 * يمسح معرف المستخدم من التخزين المحلي
 */
export function clearUserSession(): void {
  localStorage.removeItem('bn0mar_user_id');
}
