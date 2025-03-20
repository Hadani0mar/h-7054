
/**
 * يرسل طلب إلى خدمة الذكاء الاصطناعي ويعيد الاستجابة
 * @param prompt - طلب المستخدم
 * @param model - نوع النموذج المستخدم
 * @returns وعد يحتوي على استجابة الذكاء الاصطناعي
 */
export async function fetchAIResponse(prompt: string, model: string = "gpt-4"): Promise<string> {
  try {
    const response = await fetch('https://bn0mar-ai.onrender.com/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        text: prompt,
        model: model
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // الحصول على البيانات كـ JSON
    const data = await response.json();
    
    // التحقق من صيغة الاستجابة
    if (data && typeof data.response === 'string') {
      return data.response;
    } else if (data && typeof data === 'string') {
      return data;
    } else if (data && data.response) {
      // محاولة تحويل الاستجابة إلى نص
      return String(data.response);
    } else {
      console.error('Unexpected response format:', data);
      return 'حدث خطأ في معالجة الاستجابة من النموذج';
    }
  } catch (error) {
    console.error('Error in fetchAIResponse:', error);
    throw error;
  }
}

/**
 * يجلب قائمة النماذج المتاحة من الخادم
 * @returns وعد يحتوي على قائمة النماذج المتاحة
 */
export async function fetchAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch('https://bn0mar-ai.onrender.com/models', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data.models)) {
      return data.models;
    } else {
      console.error('Unexpected models format:', data);
      return ["gpt-4"]; // إرجاع النموذج الافتراضي إذا كان هناك خطأ
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    return ["gpt-4"]; // إرجاع النموذج الافتراضي إذا كان هناك خطأ
  }
}
