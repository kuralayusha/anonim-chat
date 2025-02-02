"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase ortam değişkenleri eksik");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveUUID(uuid: string) {
  const { error } = await supabase
    .from("anonim_chat_users")
    .insert([{ user_uuid: uuid }]);

  if (error) throw error;
}

export async function sendConnectionRequest(
  userUUID: string,
  targetUUID: string
) {
  const { data, error } = await supabase
    .from("anonim_chat_connections")
    .insert([
      {
        requester_uuid: userUUID,
        target_uuid: targetUUID,
        status: "pending",
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

export async function acceptConnectionRequest(connectionId: number) {
  const { error } = await supabase
    .from("anonim_chat_connections")
    .update({ status: "accepted" })
    .eq("id", connectionId);

  if (error) throw error;
}

export async function deleteConnection(connectionId: number) {
  // Önce mesajları sil
  const { error: messageError } = await supabase
    .from("anonim_chat_messages")
    .delete()
    .eq("connection_id", connectionId);

  if (messageError) throw messageError;

  // Sonra bağlantıyı sil
  const { error: connectionError } = await supabase
    .from("anonim_chat_connections")
    .delete()
    .eq("id", connectionId);

  if (connectionError) throw connectionError;
}

export async function sendMessage(
  connectionId: number,
  senderUUID: string,
  message: string
) {
  const { error } = await supabase.from("anonim_chat_messages").insert([
    {
      connection_id: connectionId,
      sender_uuid: senderUUID,
      message: message,
    },
  ]);

  if (error) throw error;
}

export async function cleanupUser(userUUID: string) {
  // Bağlantıları sil
  await supabase
    .from("anonim_chat_connections")
    .delete()
    .or(`requester_uuid.eq.${userUUID},target_uuid.eq.${userUUID}`);

  // Mesajları sil
  await supabase
    .from("anonim_chat_messages")
    .delete()
    .eq("sender_uuid", userUUID);

  // Kullanıcıyı sil
  await supabase.from("anonim_chat_users").delete().eq("user_uuid", userUUID);
}
