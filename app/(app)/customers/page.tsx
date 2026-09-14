import type { Metadata } from "next"
import { ContactIcon } from "lucide-react"

import { requireUser } from "@/lib/auth-helpers"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Customers",
}

export default async function CustomersPage() {
  await requireUser()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium">Customers</h1>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ContactIcon />
          </EmptyMedia>
          <EmptyTitle>No customers yet</EmptyTitle>
          <EmptyDescription>
            Converted leads will show up here as customers.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
