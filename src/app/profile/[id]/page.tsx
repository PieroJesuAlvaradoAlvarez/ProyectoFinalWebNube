"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Calendar, MapPin, Star, MessageCircle, Repeat2, Heart, MoreVertical, X, UserPlus, Plus, CreditCard, Smartphone, Building2, DollarSign, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al postular");
    } finally {
      setIsApplying(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(newIsLiked ? likes + 1 : likes - 1);

    try {
      await axios.post(`/api/projects/${id}/like`);
    } catch (error) {
      console.error(error);
      setIsLiked(isLiked);
      setLikes(initialLikes);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    const newIsReposted = !isReposted;
    setIsReposted(newIsReposted);
    setReposts(newIsReposted ? reposts + 1 : reposts - 1);

    try {
      await axios.post(`/api/projects/${id}/repost`);
    } catch (error) {
      console.error(error);
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

export default function Profile() {
  const { data: session, update } = useSession();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reposts");
  
  useEffect(() => {
    if (user) {
      if (user.role === 'CLIENT') {
        setActiveTab('my-projects');
      } else if (user.role === 'DEVELOPER') {
        setActiveTab('developed');
      }
    }
  }, [user]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    role: "CLIENT",
    certificates: "",
    affiliation: "",
    age: "",
    phone: "",
    location: "",
    website: ""
  });

  // New state for modals
  const [showMenuOpen, setShowMenuOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [newPaymentType, setNewPaymentType] = useState("BCP");
  const [newPayment, setNewPayment] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    yapeNumber: "",
    bcpAccount: "",
    transferAccount: "",
    paypalEmail: ""
  });
  
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isOwnProfile = session?.user && (session.user as any).id === id;

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${id}`);
      setUser(res.data);
      setReviews(res.data.reviewsReceived || []);
      setEditForm({
        name: res.data.name || "",
        bio: res.data.bio || "",
        role: res.data.role || "CLIENT",
        certificates: res.data.certificates || "",
        affiliation: res.data.affiliation || "",
        age: res.data.age?.toString() || "",
        phone: res.data.phone || "",
        location: res.data.location || "",
        website: res.data.website || ""
      });
    } catch (error) {
      console.error("Error fetching user", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const averageStars = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.stars, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`/api/users/${id}`, editForm);
      setUser(res.data);
      setIsEditing(false);
      toast.success("Perfil actualizado");
      
      if (isOwnProfile) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: editForm.name,
          },
          role: editForm.role
        });
      }
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleSendFriendRequest = async () => {
    if (!session?.user) return;
    try {
      await axios.post("/api/friend-requests", {
        senderId: (session.user as any).id,
        receiverId: id
      });
      toast.success("Solicitud de amistad enviada!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al enviar solicitud");
    }
  };

  const handleSendReview = async () => {
    if (!session?.user) return;
    try {
      await axios.post("/api/reviews", {
        reviewerId: (session.user as any).id,
        revieweeId: id,
        stars: reviewStars,
        comment: reviewComment
      });
      toast.success("Reseña enviada!");
      setShowReviewModal(false);
      setReviewComment("");
      setReviewStars(5);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al enviar reseña");
    }
  };

  const handleSendReport = async () => {
    if (!session?.user || !reportReason) {
      toast.error("Debes seleccionar un motivo");
      return;
    }
    try {
      await axios.post("/api/reports", {
        reporterId: (session.user as any).id,
        reportedId: id,
        reason: reportReason,
        description: reportDescription
      });
      toast.success("Reporte enviado!");
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al enviar reporte");
    }
  };

  const handleOpenChat = async () => {
    if (!session?.user) return;
    try {
      const res = await axios.post("/api/chats", {
        user1Id: (session.user as any).id,
        user2Id: id
      });
      router.push(`/chats/${res.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al abrir chat");
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!session?.user || !newPaymentType) return;
    try {
      await axios.post("/api/payment-methods", {
        userId: (session.user as any).id,
        type: newPaymentType,
        ...newPayment
      });
      toast.success("Método de pago agregado!");
      setShowPaymentModal(false);
      setNewPaymentType("BCP");
      setNewPayment({
        cardNumber: "",
        cardExpiry: "",
        cardCvc: "",
        yapeNumber: "",
        bcpAccount: "",
        transferAccount: "",
        paypalEmail: ""
      });
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al agregar método de pago");
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      await axios.delete(`/api/payment-methods?id=${paymentMethodId}`);
      toast.success("Método de pago eliminado!");
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al eliminar método de pago");
    }
  };

  const getPaymentMethodInfo = (type: string) => {
    switch (type) {
      case "BCP":
        return { icon: Building2, color: "#e61e2d" };
      case "YAPE":
        return { icon: Smartphone, color: "#8c2be8" };
      case "VISA":
        return { icon: CreditCard, color: "#f77e05" };
      case "PAYPAL":
        return { icon: DollarSign, color: "#003087" };
      case "TRANSFER":
        return { icon: Building2, color: "#0070ba" };
      default:
        return { icon: DollarSign, color: "#ffffff" };
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4">
      <p className="text-zinc-500">Usuario no encontrado</p>
      <button onClick={() => router.back()} className="text-blue-500 hover:underline">Volver</button>
    </div>
  );

  const repostedProjects = user.reposts?.map((repost: any) => repost.project) || [];
  const ownProjects = user.projects || [];
  const developedProjects = user.developedProjects || [];

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-800 flex items-center gap-6 px-4 py-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-grow">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-xs text-zinc-500">{user.role === 'DEVELOPER' ? 'Desarrollador' : 'Cliente'}</p>
            </div>
            {!isOwnProfile && session?.user && (
              <div className="relative">
                <button 
                  onClick={() => setShowMenuOpen(!showMenuOpen)}
                  className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
                {showMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-black border border-zinc-800 rounded-lg shadow-xl z-20 w-48">
                    <button 
                      onClick={() => {
                        handleOpenChat();
                        setShowMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-900 flex items-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Enviar mensaje
                    </button>
                    <button 
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-900 flex items-center gap-2 text-red-500"
                    >
                      <X size={16} />
                      Reportar usuario
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>

          <div className="h-48 bg-zinc-800 relative">
            <div className="absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-black bg-zinc-700" />
          </div>

          <div className="mt-20 px-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-extrabold">{user.name}</h2>
                <p className="text-zinc-500">@{user.email?.split('@')[0]}</p>
              </div>
              <div className="flex gap-2">
                {isOwnProfile && (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="border border-zinc-700 font-bold px-4 py-1.5 rounded-full hover:bg-zinc-900 transition-colors"
                    >
                      Editar perfil
                    </button>
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-blue-500 text-white font-bold px-4 py-1.5 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Métodos de pago
                    </button>
                  </>
                )}
                {!isOwnProfile && session?.user && (
                  <>
                    <button 
                      onClick={handleSendFriendRequest}
                      className="flex items-center gap-1 border border-zinc-700 font-bold px-4 py-1.5 rounded-full hover:bg-zinc-900 transition-colors"
                    >
                      <UserPlus size={16} />
                      Amistad
                    </button>
                    {user.role === 'DEVELOPER' && (
                      <button 
                        onClick={() => setShowReviewModal(true)}
                        className="bg-white text-black font-bold px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
                      >
                        Reseñar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold">Editar Perfil</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Biografía</label>
                      <textarea 
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Rol</label>
                      <select 
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="CLIENT">Solicitante de Software</option>
                        <option value="DEVELOPER">Desarrollador</option>
                      </select>
                    </div>
                    {editForm.role === 'DEVELOPER' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Certificados (separados por coma)</label>
                        <input 
                          type="text" 
                          value={editForm.certificates}
                          onChange={(e) => setEditForm({...editForm, certificates: e.target.value})}
                          placeholder="Next.js, React, Node.js..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Edad</label>
                        <input 
                          type="number" 
                          value={editForm.age}
                          onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Teléfono</label>
                        <input 
                          type="text" 
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Ubicación</label>
                      <input 
                        type="text" 
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Afiliación</label>
                      <input 
                        type="text" 
                        value={editForm.affiliation}
                        onChange={(e) => setEditForm({...editForm, affiliation: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Sitio web</label>
                      <input 
                        type="text" 
                        value={editForm.website}
                        onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 border border-zinc-700 font-bold py-2 rounded-full hover:bg-zinc-900 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-white text-black font-bold py-2 rounded-full hover:bg-zinc-200 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showPaymentModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Métodos de Pago</h2>
                    <button onClick={() => setShowPaymentModal(false)}><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-300">Agregar nuevo método</h3>
                    <select 
                      value={newPaymentType}
                      onChange={(e) => setNewPaymentType(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="BCP">BCP</option>
                      <option value="YAPE">Yape</option>
                      <option value="VISA">Visa</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="TRANSFER">Transferencia bancaria</option>
                    </select>
                    
                    {newPaymentType === 'VISA' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">Número de tarjeta</label>
                          <input 
                            type="text" 
                            value={newPayment.cardNumber}
                            onChange={(e) => setNewPayment({...newPayment, cardNumber: e.target.value})}
                            placeholder="1234 5678 9012 3456"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-1">Fecha de expiración</label>
                            <input 
                              type="text" 
                              value={newPayment.cardExpiry}
                              onChange={(e) => setNewPayment({...newPayment, cardExpiry: e.target.value})}
                              placeholder="MM/YY"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-1">CVV</label>
                            <input 
                              type="text" 
                              value={newPayment.cardCvc}
                              onChange={(e) => setNewPayment({...newPayment, cardCvc: e.target.value})}
                              placeholder="123"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {newPaymentType === 'YAPE' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Número de teléfono</label>
                        <input 
                          type="text" 
                          value={newPayment.yapeNumber}
                          onChange={(e) => setNewPayment({...newPayment, yapeNumber: e.target.value})}
                          placeholder="987654321"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    {newPaymentType === 'BCP' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Número de cuenta BCP</label>
                        <input 
                          type="text" 
                          value={newPayment.bcpAccount}
                          onChange={(e) => setNewPayment({...newPayment, bcpAccount: e.target.value})}
                          placeholder="191-123456-78-90"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    {newPaymentType === 'PAYPAL' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Correo electrónico</label>
                        <input 
                          type="email" 
                          value={newPayment.paypalEmail}
                          onChange={(e) => setNewPayment({...newPayment, paypalEmail: e.target.value})}
                          placeholder="usuario@paypal.com"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    {newPaymentType === 'TRANSFER' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Número de cuenta</label>
                        <input 
                          type="text" 
                          value={newPayment.transferAccount}
                          onChange={(e) => setNewPayment({...newPayment, transferAccount: e.target.value})}
                          placeholder="Número de cuenta"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    
                    <button 
                      onClick={handleAddPaymentMethod}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
                    >
                      Agregar método
                    </button>
                  </div>
                  
                  {user.paymentMethods && user.paymentMethods.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-zinc-300">Tus métodos</h3>
                      {user.paymentMethods.map((method: any) => {
                        const info = getPaymentMethodInfo(method.type);
                        const Icon = info.icon;
                        
                        let details = '';
                        if (method.type === 'VISA') {
                          details = method.cardNumber ? `**** ${method.cardNumber.slice(-4)}` : '';
                        } else if (method.type === 'YAPE') {
                          details = method.yapeNumber || '';
                        } else if (method.type === 'BCP') {
                          details = method.bcpAccount || '';
                        } else if (method.type === 'PAYPAL') {
                          details = method.paypalEmail || '';
                        } else if (method.type === 'TRANSFER') {
                          details = method.transferAccount || '';
                        }

                        return (
                          <div key={method.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${info.color}20` }}>
                                <Icon size={20} color={info.color} />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{method.type}</p>
                                {details && <p className="text-xs text-zinc-500">{details}</p>}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-full"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {showReviewModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Reseñar a {user.name}</h2>
                    <button onClick={() => setShowReviewModal(false)}><X size={20} /></button>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setReviewStars(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={32} 
                          fill={star <= reviewStars ? "#eab308" : "none"}
                          className={star <= reviewStars ? "text-yellow-500" : "text-zinc-600"}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Escribe tu reseña..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-blue-500 h-32 resize-none"
                  />

                  <button 
                    onClick={handleSendReview}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Enviar reseña
                  </button>
                </div>
              </div>
            )}

            {showReportModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Reportar a {user.name}</h2>
                    <button onClick={() => setShowReportModal(false)}><X size={20} /></button>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-500">Motivo</label>
                    <select 
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm outline-none focus:border-red-500"
                    >
                      <option value="">Selecciona un motivo</option>
                      <option value="spam">Spam</option>
                      <option value="fake">Perfil falso</option>
                      <option value="inappropriate">Contenido inapropiado</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-zinc-500">Descripción (opcional)</label>
                    <textarea 
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Detalla el problema..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-red-500 h-24 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 border border-zinc-700 font-bold py-2 rounded-full hover:bg-zinc-900 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSendReport}
                      className="flex-1 bg-red-500 text-white font-bold py-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      Enviar reporte
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-4 text-zinc-200">
              {user.bio || "Sin biografía."}
            </p>

            <div className="space-y-2 mt-4">
              {user.affiliation && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="text-blue-500">🏢</span> {user.affiliation}
                </div>
              )}
              {user.age && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="text-purple-500">🎂</span> {user.age} años
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="text-green-500">📞</span> {user.phone}
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <MapPin size={16} /> {user.location}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="text-yellow-500">🌐</span> 
                  <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Calendar size={16} /> {t("joined")} Mayo 2026
              </div>
              {user.role === 'DEVELOPER' && (
                <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                  <Star size={16} fill="currentColor" /> {user.averageStars || averageStars} ({user.reviewCount || reviews.length} {t("reviews")})
                </div>
              )}
            </div>

            {user.role === 'DEVELOPER' && user.certificates && (
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2">{t("certificates")}</h3>
                <div className="flex flex-wrap gap-2">
                  {user.certificates.split(',').map((cert: string, i: number) => (
                    <span key={i} className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                      {cert.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-zinc-800 mt-8 flex overflow-x-auto">
              {user.role === 'CLIENT' && (
                <button 
                  onClick={() => setActiveTab("my-projects")}
                  className={`px-4 py-4 text-center font-bold transition-colors whitespace-nowrap ${activeTab === 'my-projects' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
                >
                  Mis Proyectos
                </button>
              )}
              {user.role === 'DEVELOPER' && (
                <button 
                  onClick={() => setActiveTab("developed")}
                  className={`px-4 py-4 text-center font-bold transition-colors whitespace-nowrap ${activeTab === 'developed' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
                >
                  Proyectos Realizados
                </button>
              )}
              <button 
                onClick={() => setActiveTab("reposts")}
                className={`px-4 py-4 text-center font-bold transition-colors whitespace-nowrap ${activeTab === 'reposts' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Reposts
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-4 text-center font-bold transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'border-b-4 border-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Reseñas
              </button>
            </div>

            <div className="py-4">
              {activeTab === 'my-projects' && (
                <div className="space-y-4">
                  {ownProjects.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic">
                      No hay proyectos para mostrar.
                    </div>
                  ) : (
                    ownProjects.map((project: any) => (
                      <ProjectPost
                        key={project.id}
                        id={project.id}
                        author={user.name}
                        handle={user.email?.split('@')[0]}
                        content={project.description}
                        budget={`S/ ${project.budget}`}
                        duration={project.duration}
                        type={project.type}
                        category={project.category}
                        technologies={project.technologies}
                        paymentMethod={project.paymentMethod}
                        replies={0}
                        reposts={0}
                        likes={0}
                        applications={0}
                        isLiked={false}
                        isReposted={false}
                        canApply={false}
                        userId={(session?.user as any)?.id}
                        t={t}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      />
                    ))
                  )}
                </div>
              )}
              {activeTab === 'developed' && (
                <div className="space-y-4">
                  {developedProjects.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic">
                      No hay proyectos realizados para mostrar.
                    </div>
                  ) : (
                    developedProjects.map((project: any) => (
                      <ProjectPost
                        key={project.id}
                        id={project.id}
                        author={user.name}
                        handle={user.email?.split('@')[0]}
                        content={project.description}
                        budget={`S/ ${project.budget}`}
                        duration={project.duration}
                        type={project.type}
                        category={project.category}
                        technologies={project.technologies}
                        paymentMethod={project.paymentMethod}
                        replies={0}
                        reposts={0}
                        likes={0}
                        applications={0}
                        isLiked={false}
                        isReposted={false}
                        canApply={false}
                        userId={(session?.user as any)?.id}
                        t={t}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      />
                    ))
                  )}
                </div>
              )}
              {activeTab === 'reposts' && (
                <div className="space-y-4">
                  {repostedProjects.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic">
                      No hay reposts para mostrar.
                    </div>
                  ) : (
                    repostedProjects.map((project: any) => (
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
                        isLiked={false}
                        isReposted={true}
                        canApply={(session?.user as any)?.role === 'DEVELOPER'}
                        userId={(session?.user as any)?.id}
                        t={t}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      />
                    ))
                  )}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length === 0 && (
                    <p className="text-center py-10 text-zinc-500 italic">Este usuario aún no tiene reseñas.</p>
                  )}
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-700" />
                          <span className="font-bold text-sm">{review.reviewer?.name || "Usuario"}</span>
                        </div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.stars ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm">{review.comment}</p>
                      <p className="text-[10px] text-zinc-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
