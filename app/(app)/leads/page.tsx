import type { Metadata } from "next"
import { UsersIcon } from "lucide-react"

import { requireUser } from "@/lib/auth-helpers"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Leads",
}

export default async function LeadsPage() {
  await requireUser()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium">Leads</h1>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No leads yet</EmptyTitle>
          <EmptyDescription>
            Leads you add will appear here with search and status filters.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
