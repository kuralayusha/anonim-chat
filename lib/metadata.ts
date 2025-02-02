import { Metadata } from "next";

const defaultMetadata: Metadata = {
  title: "Anonymous Chat - Secure and Private Messaging",
  description:
    "A secure and anonymous chat platform. Your messages are automatically deleted at the end of the session.",
  keywords: "anonymous chat, private messaging, secure chat, temporary chat",
  authors: [{ name: "Anonymous Chat" }],
  creator: "Anonymous Chat",
  publisher: "Anonymous Chat",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chat.yusha.dev",
    siteName: "Anonymous Chat",
    title: "Anonymous Chat - Secure and Private Messaging",
    description:
      "A secure and anonymous chat platform. Your messages are automatically deleted at the end of the session.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anonymous Chat - Secure and Private Messaging",
    description:
      "A secure and anonymous chat platform. Your messages are automatically deleted at the end of the session.",
  },
};

export default defaultMetadata;
