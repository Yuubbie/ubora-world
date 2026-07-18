import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import PortalNav from "@/components/PortalNav";
import SubscribeForm from "./SubscribeForm";

export default async function SubscribePage() {
  const session = await getServerSession(authOptions);
  const access = await getAccessState((session!.user as any).id);

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      <div className="flex-1 bg-dot-grid min-h-screen">
        <SubscribeForm />
      </div>
    </div>
  );
}