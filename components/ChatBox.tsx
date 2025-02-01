"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import { IoSend } from "react-icons/io5";

export default function ChatBox({
  connectionId,
  userUUID,
}: {
  connectionId: number;
  userUUID: string | null;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Otomatik scroll fonksiyonu
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mesajları yükle
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("anonim_chat_messages")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [connectionId]);

  // Yeni mesajları gerçek zamanlı dinle
  useEffect(() => {
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "anonim_chat_messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [connectionId]);

  // Yeni mesaj geldiğinde veya mesajlar yüklendiğinde scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Yeni mesaj gönder
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("anonim_chat_messages").insert([
      {
        connection_id: connectionId,
        sender_uuid: userUUID,
        message: newMessage,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } else {
      setNewMessage("");
    }
  };

  // Enter tuşu ile gönderme
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E293B] shadow-xl">
      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto p-4 pt-16 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_uuid === userUUID ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] break-words rounded-lg px-4 py-2 ${
                msg.sender_uuid === userUUID
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="text-sm md:text-base">{msg.message}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj gönderme formu */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-[#334155] border-t border-[#475569]"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
            className="flex-1 p-3 rounded-full bg-[#475569] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <IoSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
