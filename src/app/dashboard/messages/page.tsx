import { getMyConversations } from "@/lib/models/messages";
import MessagesClient from "./messagesclient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages | MTD",
};

export default async function MessagesPage() {
  const conversations = await getMyConversations();

  return (
    <MessagesClient
      conversations={conversations}
    />
  );
}