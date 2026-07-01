"use client";

import { Search, Heart, Repeat2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export function RightSidebar() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [topProjects, setTopProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTopProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/projects/top");
        setTopProjects(res.data);
      } catch (error) {
        console.error("Error fetching top projects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProjects();
  }, []);

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 px-4 py-2 h-screen sticky top-0 border-l border-zinc-800">
      <div className="sticky top-2 bg-black py-2">
        <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-full border border-transparent focus-within:border-blue-500 focus-within:bg-black transition-all">
          <Search size={18} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder={t("explore") + "..."} 
            className="bg-transparent border-none outline-none w-full text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push("/explore");
              }
            }}
          />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Proyectos Top</h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {topProjects.length === 0 ? (
              <p className="text-zinc-500 text-sm">No hay proyectos aún</p>
            ) : (
              topProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="hover:bg-zinc-800/50 cursor-pointer transition-colors -mx-4 px-4 py-3 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold truncate max-w-[200px]">{project.title}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Heart size={12} />
                        {project._count.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat2 size={12} />
                        {project._count.reposts}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    S/ {project.budget} · {project.duration}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
