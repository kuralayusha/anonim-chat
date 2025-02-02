import { Metadata } from "next";
import defaultMetadata from "../../lib/metadata";

export const metadata: Metadata = {
  ...defaultMetadata,
  alternates: {
    canonical: "https://chat.yusha.dev",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
