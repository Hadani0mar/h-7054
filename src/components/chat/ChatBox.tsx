
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Update the Message interface to match the database schema
interface Message {
  id?: string;
  ride_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface ChatBoxProps {
  rideId: string;
  recipientId?: string;
}

const ChatBox = ({ rideId, recipientId }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user, profile } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // التمرير إلى آخر رسالة عند استلام رسائل جديدة
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // جلب الرسائل السابقة
  useEffect(() => {
    if (!rideId || !user) return;
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('ride_messages')
        .select(`
          *,
          sender:profiles!ride_messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('خطأ في جلب الرسائل:', error);
        return;
      }
      
      if (data) {
        setMessages(data as Message[]);
      }
    };
    
    fetchMessages();
    
    // الاشتراك في الرسائل الجديدة
    const channel = supabase
      .channel(`ride_messages_${rideId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ride_messages',
        filter: `ride_id=eq.${rideId}`
      }, async (payload) => {
        const newMsg = payload.new as Message;
        
        // جلب معلومات المرسل
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', newMsg.sender_id)
          .single();
        
        setMessages(prev => [...prev, { 
          ...newMsg, 
          sender: senderProfile || undefined 
        }]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !rideId) return;
    
    const messageData: Omit<Message, 'id' | 'created_at' | 'sender'> = {
      ride_id: rideId,
      sender_id: user.id,
      message: newMessage.trim()
    };
    
    const { error } = await supabase
      .from('ride_messages')
      .insert(messageData);
    
    if (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      return;
    }
    
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">المحادثة</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد رسائل بعد. ابدأ المحادثة الآن!
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start max-w-[80%] ${msg.sender_id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`h-8 w-8 ${msg.sender_id === user?.id ? 'ml-0 mr-2' : 'mr-0 ml-2'}`}>
                      <AvatarImage src={msg.sender?.avatar_url || ''} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div 
                        className={`rounded-lg p-2 ${
                          msg.sender_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div 
                        className={`text-xs mt-1 text-gray-500 ${
                          msg.sender_id === user?.id ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="اكتب رسالتك هنا..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 ml-2"
            />
            <Button
              type="button"
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBox;
