import type { Metadata } from "next"
import { LayoutDashboardIcon } from "lucide-react"

import { requireUser } from "@/lib/auth-helpers"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  await requireUser()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium">Dashboard</h1>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutDashboardIcon />
          </EmptyMedia>
          <EmptyTitle>No data yet</EmptyTitle>
          <EmptyDescription>
            Stats and upcoming reminders will show up here once you start
            adding leads.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
