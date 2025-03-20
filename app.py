
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import g4f
from typing import List, Dict, Optional, Any
import uuid

# تعريف تطبيق FastAPI
app = FastAPI(title="Bn0mar AI API", description="واجهة برمجة تطبيقات الذكاء الاصطناعي بواسطة Bn0mar")

# إضافة CORS إلى التطبيق للسماح بالوصول من أي مصدر
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# قاموس لتخزين المحادثات
conversations: Dict[str, List[Dict[str, str]]] = {}

# تعريف الـ Request Body للسؤال
class QuestionRequest(BaseModel):
    text: str
    model: str = "gpt-4"
    conversation_id: Optional[str] = None

# تعريف نموذج الاستجابة
class AIResponse(BaseModel):
    response: str
    conversation_id: str

# الحصول على قائمة النماذج المتاحة
@app.get("/models")
async def get_available_models():
    try:
        # الحصول على النماذج المتاحة من مكتبة g4f
        available_models = []
        for provider in g4f.Provider.__all__:
            try:
                provider_instance = getattr(g4f.Provider, provider)
                if hasattr(provider_instance, "models") and provider_instance.models:
                    for model in provider_instance.models:
                        if model not in available_models:
                            available_models.append(model)
            except Exception:
                continue
        
        # إذا لم يتم العثور على أي نماذج، أرجع النموذج الافتراضي
        if not available_models:
            available_models = ["gpt-4", "gpt-3.5-turbo"]
            
        return {"models": available_models}
    except Exception as e:
        print(f"Error fetching models: {str(e)}")
        # إرجاع نماذج افتراضية في حالة وجود خطأ
        return {"models": ["gpt-4", "gpt-3.5-turbo"]}

# تعريف الـ Endpoint الذي يستقبل السؤال
@app.post("/ask", response_model=AIResponse)
async def ask_question(request: QuestionRequest):
    question = request.text
    model = request.model
    conversation_id = request.conversation_id
    
    # إنشاء معرف محادثة جديد إذا لم يتم توفيره
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        conversations[conversation_id] = []
    elif conversation_id not in conversations:
        conversations[conversation_id] = []
    
    # إضافة سؤال المستخدم إلى المحادثة
    conversations[conversation_id].append({
        "role": "user",
        "content": question
    })
    
    # إعداد سياق المحادثة للنموذج
    messages = conversations[conversation_id].copy()
    
    # إضافة رسالة نظام في بداية المحادثة إذا لم تكن موجودة
    if not any(msg["role"] == "system" for msg in messages):
        messages.insert(0, {
            "role": "system",
            "content": "أنت مساعد ذكي طورك Bn0mar. أجب بدقة ووضوح على أسئلة المستخدم."
        })
    
    try:
        # التحقق من توفر النموذج
        if model not in await get_available_models():
            model = "gpt-4"  # استخدام النموذج الافتراضي
        
        # إرسال السؤال إلى النموذج
        response = g4f.ChatCompletion.create(
            model=model,
            messages=messages
        )
        
        # معالجة الاستجابة
        if isinstance(response, str):
            answer = response
        elif isinstance(response, dict):
            if 'choices' in response and len(response['choices']) > 0:
                answer = response['choices'][0]['message']['content']
            elif 'response' in response:
                answer = response['response']
            else:
                answer = str(response)
        else:
            answer = str(response)
        
        # إضافة رد النموذج إلى المحادثة
        conversations[conversation_id].append({
            "role": "assistant",
            "content": answer
        })
        
        # حفظ عدد محدود من الرسائل في المحادثة (20 رسالة كحد أقصى)
        if len(conversations[conversation_id]) > 21:  # 1 للنظام + 20 للمحادثة
            # الاحتفاظ برسالة النظام
            system_message = next((msg for msg in conversations[conversation_id] if msg["role"] == "system"), None)
            # الاحتفاظ بآخر 20 رسالة محادثة
            conversations[conversation_id] = [msg for msg in conversations[conversation_id][-20:] if msg["role"] != "system"]
            if system_message:
                conversations[conversation_id].insert(0, system_message)
                
    except Exception as e:
        print(f"Error: {str(e)}")
        answer = f"حدث خطأ أثناء المعالجة: {str(e)}"
    
    return AIResponse(response=answer, conversation_id=conversation_id)

# للتشغيل المحلي
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
