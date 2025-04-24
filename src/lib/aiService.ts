
interface AIResponseData {
  response: string;
  processed?: {
    text: string;
    code_blocks: string[];
  };
  session_id?: string;
  error?: string;
}

interface AIRequestOptions {
  sessionId?: string;
  model?: string;
}

/**
 * يرسل طلب إلى خدمة الذكاء الاصطناعي ويعيد الاستجابة
 * @param prompt - طلب المستخدم
 * @param options - خيارات إضافية مثل معرف الجلسة والنموذج المختار
 * @returns وعد يحتوي على استجابة الذكاء الاصطناعي
 */
export async function fetchAIResponse(prompt: string, options: AIRequestOptions = {}): Promise<AIResponseData> {
  try {
    const { sessionId, model } = options;
    
    const response = await fetch('https://bn0mar-ai.onrender.com/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        text: prompt,
        session_id: sessionId,
        model: model
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // الحصول على البيانات كـ JSON
    const data = await response.json();
    
    return data as AIResponseData;
  } catch (error) {
    console.error('Error in fetchAIResponse:', error);
    throw error;
  }
}

/**
 * يمسح محادثة سابقة باستخدام معرف الجلسة
 * @param sessionId - معرف الجلسة المراد مسحها
 * @returns وعد يحتوي على نتيجة العملية
 */
export async function clearConversation(sessionId: string): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch('https://bn0mar-ai.onrender.com/clear-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in clearConversation:', error);
    throw error;
  }
}
