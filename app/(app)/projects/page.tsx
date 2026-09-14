import type { Metadata } from "next"
import { FolderKanbanIcon } from "lucide-react"

import { requireUser } from "@/lib/auth-helpers"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Projects",
}

export default async function ProjectsPage() {
  await requireUser()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium">Projects</h1>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderKanbanIcon />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Create a project to group related leads together.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
