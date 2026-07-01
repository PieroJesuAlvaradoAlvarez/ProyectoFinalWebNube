"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

export default function ChatsList() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchChats();
    }
  }, [session?.user]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`/api/chats?userId=${(session.user as any).id}`);
      setChats(res.data);
    } catch (error) {
      toast.error("Error al cargar chats");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-zinc-500">Inicia sesión para ver tus chats</p>
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

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800 p-4">
            <h1 className="text-xl font-bold">Chats</h1>
          </header>

          <div className="flex flex-col">
            {chats.length === 0 && (
              <div className="p-8 text-center text-zinc-500 italic">
                No tienes chats aún.
              </div>
            )}
            {chats.map((chat) => {
              const otherUser = (session.user as any).id === chat.user1Id 
                ? chat.user2 
                : chat.user1;
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => router.push(`/chats/${chat.id}`)}
                  className="p-4 border-b border-zinc-800 hover:bg-zinc-900/50 cursor-pointer transition-colors flex gap-4 items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden">
                    {otherUser.image && <img src={otherUser.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold">{otherUser.name}</p>
                    <p className="text-sm text-zinc-500 truncate">
                      {chat.messages[0]?.content || "Sin mensajes"}
                    </p>
                  </div>
                  <MessageCircle size={20} className="text-zinc-500" />
                </div>
              );
            })}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
