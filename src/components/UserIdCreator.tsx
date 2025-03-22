
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { createNewUser } from '@/lib/aiService';
import { useToast } from '@/hooks/use-toast';

interface UserIdCreatorProps {
  onNewUserCreated: (userId: string) => void;
  isCreatingUser: boolean;
  setIsCreatingUser: (value: boolean) => void;
}

const UserIdCreator = ({ onNewUserCreated, isCreatingUser, setIsCreatingUser }: UserIdCreatorProps) => {
  const { toast } = useToast();

  const handleCreateNewUser = async () => {
    try {
      setIsCreatingUser(true);
      const newUserId = await createNewUser();
      onNewUserCreated(newUserId);
      toast({
        title: "تم إنشاء مستخدم جديد",
        description: `تم إنشاء معرف مستخدم جديد بنجاح: ${newUserId.substring(0, 8)}...`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء معرف مستخدم جديد. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <Button
        onClick={handleCreateNewUser}
        disabled={isCreatingUser}
        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
      >
        {isCreatingUser ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            جاري إنشاء مستخدم جديد...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            إنشاء معرف مستخدم جديد
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default UserIdCreator;
