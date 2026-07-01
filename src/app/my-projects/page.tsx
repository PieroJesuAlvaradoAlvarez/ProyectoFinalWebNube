"use client";

import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Clock, Users, Trash2, Star, X, CreditCard, DollarSign, Smartphone, Building2 } from "lucide-react";

export default function MyProjects() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchMyProjects();
    }
  }, [session]);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/projects/my-projects?clientId=${(session?.user as any).id}`);
      setProjects(res.data);
    } catch (error) {
      toast.error("Error al cargar tus proyectos");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodInfo = (method: string) => {
    switch (method) {
      case "BCP":
        return { icon: Building2, color: "#e61e2d" };
      case "Yape":
        return { icon: Smartphone, color: "#8c2be8" };
      case "Visa":
        return { icon: CreditCard, color: "#f77e05" };
      case "PayPal":
        return { icon: DollarSign, color: "#003087" };
      case "Transferencia":
        return { icon: Building2, color: "#0070ba" };
      default:
        return { icon: DollarSign, color: "#ffffff" };
    }
  };

  const handleFinalize = async (project: any) => {
    try {
      if (project.developerId) {
        setSelectedProject(project);
        setSelectedPaymentMethod(project.paymentMethod || "");
        setShowPaymentModal(true);
      } else {
        await axios.patch(`/api/projects/${project.id}`, { status: "COMPLETED" });
        toast.success(t("finalize_success") || "Proyecto finalizado");
        fetchMyProjects();
      }
    } catch (error) {
      toast.error("Error al finalizar");
    }
  };

  const proceedToReview = () => {
    setShowPaymentModal(false);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    try {
      // 1. Mark project as completed and payment as paid
      await axios.patch(`/api/projects/${selectedProject.id}`, { 
        status: "COMPLETED",
        paymentStatus: "PAID"
      });
      
      // 2. Submit review
      await axios.post("/api/reviews", {
        projectId: selectedProject.id,
        reviewerId: (session?.user as any).id,
        revieweeId: selectedProject.developerId,
        stars: reviewStars,
        comment: reviewComment
      });

      toast.success("Proyecto finalizado, pago marcado como completado y reseña enviada");
      setShowReviewModal(false);
      setReviewComment("");
      fetchMyProjects();
    } catch (error) {
      toast.error("Error al procesar la reseña");
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      toast.error("Debes poner una razón");
      return;
    }
    try {
      await axios.patch(`/api/projects/${selectedProject.id}`, { 
        status: "CANCELLED",
        cancelReason 
      });
      toast.success("Proyecto cancelado");
      setShowCancelModal(false);
      setCancelReason("");
      fetchMyProjects();
    } catch (error) {
      toast.error("Error al cancelar");
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-grow border-r border-zinc-800 max-w-[600px] min-h-screen p-4">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">{t("my_projects")}</h1>
          </header>

          {loading ? (
            <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full" /></div>
          ) : (
            <div className="space-y-4">
              {projects.length === 0 && (
                <p className="text-zinc-500 italic text-center py-10">No has publicado proyectos aún.</p>
              )}
              {projects.map((project: any) => (
                <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{project.title}</h3>
                      <div className="flex gap-3 text-xs text-zinc-500 mt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> {project.duration}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {project.type === 'UNITARY' ? t("unitary") : t("group")}</span>
                        <span className="text-green-500 font-bold">S/ {project.budget}</span>
                      </div>
                    </div>
                    <StatusBadge status={project.status} t={t} />
                  </div>

                  <p className="text-sm text-zinc-300 line-clamp-2">{project.description}</p>

                  <div className="flex gap-2 pt-2">
                    {project.status === 'OPEN' && (
                      <>
                        <button 
                          onClick={() => {
                            setSelectedProject(project);
                            setShowCancelModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 border border-red-500/50 text-red-500 text-sm font-bold py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={16} /> {t("cancel")}
                        </button>
                      </>
                    )}
                    {(project.status === 'OPEN' || project.status === 'IN_PROGRESS') && (
                      <button 
                        onClick={() => handleFinalize(project)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle2 size={16} /> {t("finalize")}
                      </button>
                    )}
                    {project.status === 'CANCELLED' && (
                      <div className="w-full p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                        <span className="font-bold">Razón:</span> {project.cancelReason}
                      </div>
                    )}
                  </div>

                  {/* Applicants section */}
                  {project.status === 'OPEN' && project.applications?.length > 0 && (
                    <div className="mt-4 border-t border-zinc-800 pt-4">
                      <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><Users size={16} /> {t("applicants")} ({project.applications.length})</h4>
                      <div className="space-y-2">
                        {project.applications.map((app: any) => (
                          <div key={app.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-zinc-700" />
                              <div>
                                <p className="text-sm font-bold">{app.developer.name}</p>
                                <p className="text-[10px] text-zinc-500">@{app.developer.email.split('@')[0]}</p>
                              </div>
                            </div>
                            <button className="text-xs bg-blue-500 px-3 py-1 rounded-full font-bold">Seleccionar</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Pago del Proyecto</h2>
              <button onClick={() => setShowPaymentModal(false)}><X size={20} /></button>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-green-500">S/ {selectedProject.budget}</p>
              <p className="text-sm text-zinc-500">{selectedProject.title}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-zinc-500">Método de Pago Seleccionado:</p>
              {(() => {
                const paymentInfo = getPaymentMethodInfo(selectedProject.paymentMethod || "");
                const PaymentIcon = paymentInfo.icon;
                return (
                  <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${paymentInfo.color}20` }}>
                      <PaymentIcon size={24} color={paymentInfo.color} />
                    </div>
                    <div>
                      <p className="font-bold">{selectedProject.paymentMethod}</p>
                      <p className="text-xs text-zinc-500">
                        {selectedProject.paymentMethod === "BCP" && "Pago mediante billetera digital BCP"}
                        {selectedProject.paymentMethod === "Yape" && "Pago rápido mediante Yape"}
                        {selectedProject.paymentMethod === "Visa" && "Pago seguro con tarjeta Visa o Mastercard"}
                        {selectedProject.paymentMethod === "PayPal" && "Pago internacional via PayPal"}
                        {selectedProject.paymentMethod === "Transferencia" && "Transferencia bancaria directa"}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-xs text-yellow-200 space-y-1">
              <p className="font-bold">Nota:</p>
              <p>Esta es una simulación de pago. En una aplicación real, aquí se integraría con un proveedor de pagos real (Mercado Pago, Stripe, etc.).</p>
            </div>

            <button 
              onClick={proceedToReview}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-600/20"
            >
              Confirmar Pago y Continuar
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold">{t("cancel_reason")}</h2>
            <p className="text-sm text-zinc-500">Explica por qué cancelas el proyecto. Esta razón le llegará al desarrollador.</p>
            <textarea 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Escribe el motivo aquí..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:border-red-500 h-32 resize-none"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border border-zinc-700 font-bold py-2 rounded-full hover:bg-zinc-900"
              >
                Volver
              </button>
              <button 
                onClick={handleCancel}
                className="flex-1 bg-red-500 text-white font-bold py-2 rounded-full hover:bg-red-600"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Finalizar y Calificar</h2>
              <button onClick={() => setShowReviewModal(false)}><X size={20} /></button>
            </div>
            
            <p className="text-zinc-400 text-sm text-center">
              El proyecto ha terminado. ¿Cómo calificarías el trabajo del desarrollador?
            </p>

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
              placeholder="Deja un comentario sobre tu experiencia..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-blue-500 h-32 resize-none"
            />

            <button 
              onClick={submitReview}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            >
              Finalizar y enviar reseña
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, t }: any) {
  const styles: any = {
    OPEN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    IN_PROGRESS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}
