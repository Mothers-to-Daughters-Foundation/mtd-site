import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMenteeAccess } from "@/lib/access";
import { getMyConversations } from "@/lib/models/messages";
import LockedFeature from "@/components/dashboard/LockedFeature";
import MessagesClient from "./messagesclient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages | MTD",
};

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return <LockedFeature feature="Messages" reason={access.reason} />;
  }

  const conversations = await getMyConversations();

  return (
    <MessagesClient
      conversations={conversations}
    />
  );
}