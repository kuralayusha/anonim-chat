"use client"; // Client Component olarak işaretle

import { useEffect, useState, Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../lib/supabaseClient";
import ConnectionStatus from "../../components/ConnectionStatus";
import ChatBox from "../../components/ChatBox";
import ConnectionList from "../../components/ConnectionList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoMenu, IoCopy, IoClose, IoLink } from "react-icons/io5";
import { translations, Language } from "../../lib/translations";
import LanguageToggle from "../../components/LanguageToggle";
import { useRouter, useSearchParams } from "next/navigation";

function AnonymousChatContent() {
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const [targetUUID, setTargetUUID] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "waiting" | "connected"
  >("idle");
  const [activeConnectionId, setActiveConnectionId] = useState<number | null>(
    null
  );
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>("tr");
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = translations[lang];

  const toggleLanguage = () => {
    setLang((prev) => (prev === "tr" ? "en" : "tr"));
  };

  useEffect(() => {
    const newUUID = uuidv4();
    setUserUUID(newUUID);
    sessionStorage.setItem("userUUID", newUUID);

    // URL'den chat parametresini kontrol et
    const connectToUUID = searchParams.get("chat");
    if (connectToUUID) {
      setTargetUUID(connectToUUID);
      // Mobil görünümde sidebar'ı aç
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(true);
      }
      // Kısa bir gecikme ile otomatik bağlantı isteği gönder
      setTimeout(() => {
        const connectButton = document.querySelector("[data-connect-button]");
        if (connectButton instanceof HTMLButtonElement) {
          connectButton.click();
        }
        // URL'den parametreyi kaldır
        router.replace("/anonymous-chat", { scroll: false });
      }, 1000);
    }

    supabase
      .from("anonim_chat_users")
      .insert([{ user_uuid: newUUID }])
      .then(({ error }) => {
        if (error) console.error("Error saving UUID:", error);
      });
  }, []);

  // Bağlantı isteği gönderme fonksiyonunu güncelle
  const handleConnect = async (targetId?: string) => {
    const finalTargetUUID = targetId || targetUUID;
    if (!userUUID || !finalTargetUUID) return;

    const { data, error } = await supabase
      .from("anonim_chat_connections")
      .insert([
        {
          requester_uuid: userUUID,
          target_uuid: finalTargetUUID,
          status: "pending",
        },
      ]);

    if (error) {
      toast.error(t.errorSendingRequest);
      console.error(error);
    } else {
      setConnectionStatus("waiting");
      toast.info(t.waitingConnection);
    }
  };

  // Gelen bağlantı isteklerini dinle
  useEffect(() => {
    if (!userUUID) return;

    const subscription = supabase
      .channel("incoming-requests")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "anonim_chat_connections" },
        (payload) => {
          if (payload.new.target_uuid === userUUID) {
            setIncomingRequests((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userUUID]);

  useEffect(() => {
    if (!userUUID) return;

    // Bağlantı durumunu dinle
    const connectionSubscription = supabase
      .channel("connection-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "anonim_chat_connections",
          filter: `requester_uuid=eq.${userUUID}`,
        },
        (payload) => {
          if (payload.new.status === "accepted") {
            setConnectionStatus("connected");
            setActiveConnectionId(payload.new.id);
            toast.success(t.connectionEstablished);

            // Mobil görünümde sidebar'ı kapat
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }

            const newConnection = {
              ...payload.new,
              status: "accepted",
            };
            setIncomingRequests((prev) => [...prev, newConnection]);
            setTargetUUID("");
          }
        }
      )
      .subscribe();

    return () => {
      connectionSubscription.unsubscribe();
    };
  }, [userUUID]);

  // Bağlantı isteğini kabul et
  const handleAcceptRequest = async (connectionId: number) => {
    const { error } = await supabase
      .from("anonim_chat_connections")
      .update({ status: "accepted" })
      .eq("id", connectionId);

    if (error) {
      toast.error(t.errorAcceptingRequest);
    } else {
      const acceptedConnection = incomingRequests.find(
        (req) => req.id === connectionId
      );

      if (acceptedConnection) {
        setIncomingRequests((prev) =>
          prev.map((req) =>
            req.id === connectionId ? { ...req, status: "accepted" } : req
          )
        );

        setConnectionStatus("connected");
        setActiveConnectionId(connectionId);
        toast.success(t.connectionEstablished);

        // Mobil görünümde sidebar'ı kapat
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      }
    }
  };

  // Sayfa yenilendiğinde kullanıcıyı ve bağlantıları temizle
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userUUID) {
        supabase
          .from("anonim_chat_users")
          .delete()
          .eq("user_uuid", userUUID)
          .then(({ error }) => {
            if (error) console.error("Error deleting user:", error);
          });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userUUID]);

  const handleDeleteConnection = async (connectionId: number) => {
    // Önce mesajları sil
    const { error: messageError } = await supabase
      .from("anonim_chat_messages")
      .delete()
      .eq("connection_id", connectionId);

    if (messageError) {
      toast.error("Mesajlar silinirken hata oluştu");
      console.error(messageError);
      return;
    }

    // Ardından bağlantıyı sil
    const { error: connectionError } = await supabase
      .from("anonim_chat_connections")
      .delete()
      .eq("id", connectionId);

    if (connectionError) {
      toast.error("Bağlantı silinirken hata oluştu");
      console.error(connectionError);
    } else {
      toast.success("Bağlantı ve sohbet geçmişi silindi");
      setIncomingRequests((prev) =>
        prev.filter((req) => req.id !== connectionId)
      );
      if (activeConnectionId === connectionId) {
        setActiveConnectionId(null);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (userUUID) {
        // Kullanıcının tüm bağlantılarını sil
        const { error: connectionError } = await supabase
          .from("anonim_chat_connections")
          .delete()
          .or(`requester_uuid.eq.${userUUID},target_uuid.eq.${userUUID}`);

        if (connectionError) {
          console.error("Error deleting connections:", connectionError);
        }

        // Kullanıcının tüm mesajlarını sil
        const { error: messageError } = await supabase
          .from("anonim_chat_messages")
          .delete()
          .eq("sender_uuid", userUUID);

        if (messageError) {
          console.error("Error deleting messages:", messageError);
        }

        // Kullanıcıyı sil
        const { error: userError } = await supabase
          .from("anonim_chat_users")
          .delete()
          .eq("user_uuid", userUUID);

        if (userError) {
          console.error("Error deleting user:", userError);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userUUID]);

  const [unreadMessages, setUnreadMessages] = useState<{
    [key: number]: number;
  }>({});

  useEffect(() => {
    const subscription = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "anonim_chat_messages",
        },
        (payload) => {
          if (
            payload.new.connection_id !== activeConnectionId &&
            payload.new.sender_uuid !== userUUID
          ) {
            setUnreadMessages((prev) => ({
              ...prev,
              [payload.new.connection_id]:
                (prev[payload.new.connection_id] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [activeConnectionId, userUUID]);

  const handleChatOpen = (connectionId: number) => {
    setActiveConnectionId(connectionId);
    setUnreadMessages((prev) => ({ ...prev, [connectionId]: 0 }));
    // Mobil görünümde sidebar'ı kapat
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0F172A] text-gray-100 overflow-hidden">
      <ToastContainer theme="dark" />

      {/* Mobil Menü Butonu */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E293B] rounded-lg hover:bg-[#334155] transition-colors"
      >
        {isSidebarOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static w-[320px] h-full bg-[#1E293B]/95 backdrop-blur-sm p-4 transition-transform duration-300 ease-in-out z-40 border-r border-[#334155]/50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full pt-14 lg:pt-4">
          {/* UUID Bölümü */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#94A3B8]">{t.uuid}</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={userUUID || ""}
                  readOnly
                  className="flex-1 px-3 py-1.5 bg-[#334155]/50 rounded text-sm text-gray-100 focus:outline-none border border-[#475569]/20"
                />

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userUUID || "");
                    toast.success(t.uuidCopied);
                  }}
                  className="p-1.5 bg-[#334155]/50 hover:bg-[#475569]/50 text-[#94A3B8] rounded transition-colors border border-[#475569]/20"
                >
                  <IoCopy size={16} />
                </button>

                <button
                  onClick={() => {
                    const inviteLink = `${window.location.origin}/anonymous-chat?chat=${userUUID}`;
                    navigator.clipboard.writeText(inviteLink);
                    toast.success(t.inviteLinkCopied);
                  }}
                  className="p-1.5 bg-[#334155]/50 hover:bg-[#475569]/50 text-[#94A3B8] rounded transition-colors border border-[#475569]/20"
                  title={t.createInviteLink}
                >
                  <IoLink size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[#94A3B8]">{t.connect}</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={targetUUID}
                  onChange={(e) => setTargetUUID(e.target.value)}
                  placeholder={t.enterUUID}
                  className="flex-1 px-3 py-1.5 bg-[#334155]/50 rounded text-sm text-gray-100 placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] border border-[#475569]/20"
                />
                <button
                  data-connect-button
                  onClick={() => handleConnect(targetUUID)}
                  className={`p-1.5 rounded transition-colors border border-[#475569]/20 ${
                    connectionStatus === "waiting"
                      ? "bg-[#CA8A04]/30 text-[#FDE047] border-[#CA8A04]/30"
                      : connectionStatus === "connected"
                      ? "bg-[#059669]/30 text-[#6EE7B7] border-[#059669]/30"
                      : "bg-[#3B82F6]/30 hover:bg-[#3B82F6]/40 text-[#93C5FD] border-[#3B82F6]/30"
                  }`}
                >
                  <IoMenu size={16} className="rotate-90" />
                </button>
              </div>
              {connectionStatus === "waiting" && (
                <p className="text-xs text-[#FDE047]/80">
                  {t.waitingConnection}
                </p>
              )}
            </div>
          </div>

          {/* Bağlantılar Listesi */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h2 className="text-sm font-medium text-[#94A3B8] mb-3">
              {t.connections}
            </h2>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#475569] scrollbar-track-transparent">
              <ConnectionList
                lang={lang}
                incomingRequests={incomingRequests}
                onAccept={handleAcceptRequest}
                onDeleteConnection={handleDeleteConnection}
                onChatOpen={handleChatOpen}
                unreadMessages={unreadMessages}
              />
            </div>
          </div>
          <div className="mt-auto pt-4">
            <LanguageToggle currentLang={lang} onToggle={toggleLanguage} />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Ana İçerik - düzenlendi */}
      <div className="flex-1 flex flex-col h-screen relative">
        <div className="absolute inset-0 lg:pl-[320px]">
          <div className="h-full w-full">
            {activeConnectionId ? (
              <ChatBox connectionId={activeConnectionId} userUUID={userUUID} />
            ) : (
              <div className="h-full flex items-center justify-center text-[#94A3B8]">
                <p>{t.selectChat}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnonymousChatContent />
    </Suspense>
  );
}
