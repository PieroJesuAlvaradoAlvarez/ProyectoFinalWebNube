"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ArrowLeft, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

export default function ChatDetail() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (chatId && session?.user) {
      fetchChatAndMessages();
    }
  }, [chatId, session?.user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatAndMessages = async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      // First get user's chats to find the right one
      const chatsRes = await axios.get(`/api/chats?userId=${(session.user as any).id}`);
      const foundChat = chatsRes.data.find((c: any) => c.id === chatId);
      
      if (!foundChat) {
        toast.error("Chat no encontrado");
        router.back();
        return;
      }
      
      setChat(foundChat);
      
      // Then get messages
      const messagesRes = await axios.get(`/api/messages?chatId=${chatId}`);
      setMessages(messagesRes.data);
    } catch (error) {
      toast.error("Error al cargar el chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !session?.user) return;

    setSending(true);
    try {
      const res = await axios.post("/api/messages", {
        chatId,
        senderId: (session.user as any).id,
        content: newMessage.trim()
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (error) {
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-zinc-500">Inicia sesión para ver este chat</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-zinc-500 italic">Chat no encontrado</p>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline">Volver</button>
      </div>
    );
  }

  const otherUser = (session.user as any).id === chat.user1Id 
    ? chat.user2 
    : chat.user1;

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen flex flex-col">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800 flex items-center gap-6 px-4 py-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden">
                {otherUser.image && <img src={otherUser.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="font-bold">{otherUser.name}</p>
                <p className="text-xs text-zinc-500">{chat.project ? chat.project.title : "Chat directo"}</p>
              </div>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 py-8">
                No hay mensajes aún. ¡Envía el primero!
              </div>
            )}
            {messages.map((message) => {
              const isOwn = message.senderId === (session.user as any).id;
              return (
                <div 
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      isOwn 
                        ? 'bg-blue-500 text-white rounded-br-sm' 
                        : 'bg-zinc-800 text-white rounded-bl-sm'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 flex gap-3">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-grow bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 outline-none focus:border-blue-500"
            />
            <button 
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white p-2 rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
