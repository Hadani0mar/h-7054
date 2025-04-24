
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Car, User, Star, MapPin, Globe, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <header className="container mx-auto pt-8 pb-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8" />
            <h1 className="text-3xl font-bold">OusTaa</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              تسجيل الدخول
            </Button>
            <Button onClick={() => navigate('/auth?tab=register')}>
              إنشاء حساب
            </Button>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto pt-8 pb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            خدمة تاكسي بضغطة زر
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            تطبيق OusTaa يوفر لك خدمة طلب سيارات أجرة بسهولة وأمان في جميع أنحاء ليبيا
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg" onClick={() => navigate('/auth?type=rider')}>
              <User className="h-5 w-5 mr-2" />
              سجل كراكب
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => navigate('/auth?type=driver')}>
              <Car className="h-5 w-5 mr-2" />
              سجل كسائق
            </Button>
          </div>
        </motion.div>
      </header>
      
      <section className="bg-white dark:bg-slate-950 py-16">
        <div className="container mx-auto px-4">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            لماذا تختار OusTaa؟
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
                      <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">سهولة الاستخدام</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      طلب سيارة بضغطة زر، وتتبع رحلتك في الوقت الحقيقي
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
                      <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">أمان وموثوقية</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      سائقون موثوقون ومعتمدون، ونظام تقييم شفاف
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full mb-4">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">أسعار عادلة</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      أسعار ثابتة وشفافة، بدون رسوم خفية
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <h3 className="text-3xl font-bold mb-4">
                كن سائقاً معنا
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                انضم إلى فريق السائقين لدينا وابدأ في كسب الدخل على جدولك الخاص. تحكم بساعات عملك وزود دخلك.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>جدول مرن - اعمل في الأوقات التي تناسبك</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>دخل إضافي - اكسب المال في وقت فراغك</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>عملية تسجيل بسيطة وسريعة</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/auth?type=driver')}>
                سجل كسائق الآن
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-2xl">
                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1534070189982-818bb5622474?q=80&w=1000&auto=format&fit=crop"
                    alt="Driver" 
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="bg-white dark:bg-slate-950 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <h3 className="text-3xl font-bold mb-4">
                تنقل بسهولة وأمان
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                لا مزيد من الانتظار للحافلات أو المشي لمسافات طويلة. اطلب سيارة إلى موقعك واستمتع برحلة مريحة إلى وجهتك.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>سيارات نظيفة ومريحة</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>سائقون محترفون ومدربون</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>تتبع رحلتك في الوقت الحقيقي</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/auth?type=rider')}>
                سجل كراكب الآن
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1 rounded-2xl">
                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000&auto=format&fit=crop"
                    alt="Passenger" 
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6"
          >
            تغطية في جميع أنحاء ليبيا
          </motion.h3>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            نعمل على تقديم خدماتنا في جميع المدن الليبية الرئيسية، مع خطط للتوسع إلى المزيد من المناطق قريباً.
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-2xl mx-auto h-[400px] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800"
          >
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <Globe className="h-12 w-12" />
            </div>
          </motion.div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Badge className="px-4 py-2 text-sm">طرابلس</Badge>
            <Badge className="px-4 py-2 text-sm">بنغازي</Badge>
            <Badge className="px-4 py-2 text-sm">مصراتة</Badge>
            <Badge className="px-4 py-2 text-sm">زليتن</Badge>
            <Badge className="px-4 py-2 text-sm">الزاوية</Badge>
            <Badge className="px-4 py-2 text-sm">سبها</Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">المزيد قريباً...</Badge>
          </div>
        </div>
      </section>
      
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Car className="h-8 w-8" />
              <span className="text-2xl font-bold">OusTaa</span>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <Button variant="link">عن التطبيق</Button>
              <Button variant="link">الشروط والأحكام</Button>
              <Button variant="link">سياسة الخصوصية</Button>
              <Button variant="link">اتصل بنا</Button>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            &copy; {new Date().getFullYear()} OusTaa. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
