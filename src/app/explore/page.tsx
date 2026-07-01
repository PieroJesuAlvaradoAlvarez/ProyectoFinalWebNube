"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  MessageCircle,
  Repeat2,
  Heart,
  Search
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function ProjectPost({ id, author, handle, content, budget, duration, type, category, technologies, paymentMethod, replies, reposts: initialReposts, likes: initialLikes, applications, isLiked: initialIsLiked, isReposted: initialIsReposted, isProject = true, canApply, userId, t, onClick, onUpdate }: any) {
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyReason, setApplyReason] = useState("");
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [reposts, setReposts] = useState(initialReposts);

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    if (!applyReason) {
      toast.error("Debes poner un motivo para postular");
      return;
    }

    setIsApplying(true);
    try {
      await axios.post("/api/applications", {
        projectId: id,
        developerId: userId,
        reason: applyReason,
      });
      toast.success("¡Postulación enviada!");
      setShowApplyModal(false);
      setApplyReason("");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al postular");
    } finally {
      setIsApplying(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(newIsLiked ? likes + 1 : likes - 1);

    try {
      await axios.post(`/api/projects/${id}/like`);
    } catch (error) {
      console.error(error);
      // Revert if error
      setIsLiked(isLiked);
      setLikes(initialLikes);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    // Optimistic update
    const newIsReposted = !isReposted;
    setIsReposted(newIsReposted);
    setReposts(newIsReposted ? reposts + 1 : reposts - 1);

    try {
      await axios.post(`/api/projects/${id}/repost`);
    } catch (error) {
      console.error(error);
      // Revert if error
      setIsReposted(isReposted);
      setReposts(initialReposts);
    }
  };

  return (
    <>
      <div 
        onClick={onClick}
        className="p-4 border-b border-zinc-800 hover:bg-zinc-900/50 cursor-pointer transition-colors flex gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex-shrink-0" />
        <div className="flex-grow">
          <div className="flex items-center gap-1">
            <span className="font-bold hover:underline">{author}</span>
            <span className="text-zinc-500 text-sm">@{handle}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap">{content}</p>
          
          {isProject && (
            <div className="mt-3 p-3 border border-zinc-700 rounded-2xl bg-zinc-900/50 flex flex-wrap gap-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("budget")}</p>
                <p className="font-bold text-sm text-green-500">{budget}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("duration")}</p>
                <p className="font-bold text-sm">{duration}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("category")}</p>
                <p className="font-bold text-sm text-blue-400">{category}</p>
              </div>
              {technologies && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("technologies")}</p>
                  <p className="font-bold text-sm">{technologies}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{t("project_type")}</p>
                <p className="font-bold text-sm">{type === 'UNITARY' ? t("unitary") : t("group")}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Postulados</p>
                <p className="font-bold text-sm">{applications}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-zinc-500 max-w-md">
            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors group">
              <div className="p-2 group-hover:bg-blue-500/10 rounded-full"><MessageCircle size={18} /></div>
              <span className="text-xs">{replies}</span>
            </div>
            <div 
              onClick={handleRepost}
              className={`flex items-center gap-1 transition-colors group cursor-pointer ${isReposted ? 'text-green-500' : 'hover:text-green-500'}`}
            >
              <div className={`p-2 rounded-full ${isReposted ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'}`}>
                <Repeat2 size={18} />
              </div>
              <span className="text-xs">{reposts}</span>
            </div>
            <div 
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors group cursor-pointer ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <div className={`p-2 rounded-full ${isLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </div>
              <span className="text-xs">{likes}</span>
            </div>
            {canApply && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowApplyModal(true);
                }}
                className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
              >
                {t("apply")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold">{t("apply")} - {author}</h2>
            <div className="space-y-1">
              <label className="text-sm text-zinc-500">{t("apply_reason")}</label>
              <textarea 
                value={applyReason}
                onChange={(e) => setApplyReason(e.target.value)}
                placeholder="Hola, me interesa porque..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-blue-500 h-32 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowApplyModal(false)}
                className="flex-1 border border-zinc-700 font-bold py-2 rounded-full hover:bg-zinc-900 transition-colors"
              >
                {t("cancel")}
              </button>
              <button 
                onClick={handleApply}
                disabled={isApplying}
                className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isApplying ? "..." : t("apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Explore() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async (searchTerm: string = "", cat: string = "", type: string = "") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (cat) params.append("category", cat);
    if (type) params.append("type", type);
    if (session?.user) params.append("userId", (session.user as any).id);

    axios.get(`/api/projects?${params.toString()}`)
      .then(res => {
        setProjects(res.data);
      })
      .catch(err => {
        toast.error("Error al buscar proyectos");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects(search, category, projectType);
  }, [search, category, projectType, session?.user]);

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800 p-4 space-y-3">
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-full border border-transparent focus-within:border-blue-500 focus-within:bg-black transition-all">
              <Search size={18} className="text-zinc-500" />
              <input 
                type="text" 
                placeholder={t("explore") + "..."} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="">Todas categorías</option>
                <option value="WEB">Web</option>
                <option value="MOBILE">Móvil</option>
                <option value="GAMES">Juegos</option>
                <option value="DESKTOP">Escritorio</option>
                <option value="OTHER">Otro</option>
              </select>

              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="">Todos tipos</option>
                <option value="UNITARY">Unitario</option>
                <option value="GROUP">Grupo</option>
              </select>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex flex-col">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 italic">
                  No hay proyectos que coincidan con tu búsqueda.
                </div>
              ) : (
                projects.map((project: any) => (
                  <ProjectPost
                    key={project.id}
                    id={project.id}
                    author={project.client?.name || "Usuario"} 
                    handle={project.client?.email?.split('@')[0] || "user"} 
                    content={project.description}
                    budget={`S/ ${project.budget}`}
                    duration={project.duration}
                    type={project.type}
                    category={project.category}
                    technologies={project.technologies}
                    paymentMethod={project.paymentMethod}
                    replies={project._count?.applications || 0}
                    reposts={project._count?.reposts || 0}
                    likes={project._count?.likes || 0}
                    applications={project._count?.applications || 0}
                    isLiked={project.isLiked}
                    isReposted={project.isReposted}
                    canApply={(session?.user as any)?.role === "DEVELOPER"}
                    userId={(session?.user as any)?.id}
                    t={t}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    onUpdate={() => fetchProjects(search, category, projectType)}
                  />
                ))
              )}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
