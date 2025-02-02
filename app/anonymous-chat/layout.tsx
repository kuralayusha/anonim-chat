import { Metadata } from "next";
import defaultMetadata from "../../lib/metadata";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Anonymous Chat - Secure Communication",
  description:
    "Chat securely and anonymously. All your messages are deleted at the end of the session.",
  alternates: {
    canonical: "https://chat.yusha.dev/anonymous-chat",
  },
};

export default function AnonymousChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
