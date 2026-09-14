import {
  Contact,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Customers", href: "/customers", icon: Contact },
  { title: "Settings", href: "/settings", icon: Settings },
]
