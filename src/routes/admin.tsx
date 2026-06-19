import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Rybus" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminGate><Outlet /></AdminGate>,
});
