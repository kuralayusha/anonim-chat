import { IoCheckmark, IoClose, IoTrash } from "react-icons/io5";
import { translations, Language } from "../lib/translations";

export default function ConnectionList({
  incomingRequests,
  onAccept,
  onDeleteConnection,
  onChatOpen,
  unreadMessages,
  lang,
}: {
  incomingRequests: any[];
  onAccept: (connectionId: number) => void;
  onDeleteConnection: (connectionId: number) => void;
  onChatOpen: (connectionId: number) => void;
  unreadMessages: { [key: number]: number };
  lang: Language;
}) {
  const t = translations[lang];

  return (
    <div className="space-y-2">
      {incomingRequests.map((request) => (
        <div
          key={`${request.id}-${request.requester_uuid}`} // Benzersiz key
          className="p-3 bg-[#334155]/50 rounded-lg border border-[#475569]/20 group hover:bg-[#334155]/70 transition-colors"
          onClick={() => onChatOpen(request.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#94A3B8] mb-1">
                {request.status === "accepted"
                  ? t.connected
                  : t.incomingRequest}
              </p>
              <p
                className="text-sm text-gray-100 truncate"
                title={
                  request.status === "accepted"
                    ? request.requester_uuid
                    : request.target_uuid
                }
              >
                {request.status === "accepted"
                  ? request.requester_uuid
                  : request.target_uuid}
              </p>
              {unreadMessages[request.id] > 0 && (
                <span className="text-xs text-[#3B82F6]">
                  {unreadMessages[request.id]} okunmamış mesaj
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {request.status === "pending" ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(request.id);
                    }}
                    className="p-1.5 rounded-lg bg-[#059669]/30 text-[#6EE7B7] hover:bg-[#059669]/40 border border-[#059669]/30 transition-colors"
                    title="Kabul Et"
                  >
                    <IoCheckmark size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConnection(request.id);
                    }}
                    className="p-1.5 rounded-lg bg-[#DC2626]/30 text-[#FCA5A5] hover:bg-[#DC2626]/40 border border-[#DC2626]/30 transition-colors"
                    title="Reddet"
                  >
                    <IoClose size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConnection(request.id);
                  }}
                  className="p-1.5 rounded-lg bg-[#DC2626]/30 text-[#FCA5A5] hover:bg-[#DC2626]/40 border border-[#DC2626]/30 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Sohbeti Sil"
                >
                  <IoTrash size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {incomingRequests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-[#94A3B8]">{t.noConnections}</p>
          <p className="text-xs text-[#64748B] mt-1">{t.shareUUID}</p>
        </div>
      )}
    </div>
  );
}
