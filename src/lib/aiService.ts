
/**
 * يرسل طلب إلى خدمة الذكاء الاصطناعي ويعيد الاستجابة
 * @param prompt - طلب المستخدم
 * @returns وعد يحتوي على استجابة الذكاء الاصطناعي
 */
export async function fetchAIResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://bn0mar-ai.onrender.com/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ prompt }),
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
