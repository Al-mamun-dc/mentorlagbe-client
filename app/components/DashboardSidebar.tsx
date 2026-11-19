
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useSession } from "@/lib/auth-client"

import {
  LayoutDashboard,
  BookOpen,
  User,
  Users,
  PlusCircle,
  GraduationCap,
  ClipboardList,
  Settings,
  ShieldCheck,
} from "lucide-react"

type Role = "student" | "tutor" | "admin"

const menuItemByRole = {
  student: [
    {
      name: "Student Dashboard",
      url: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      name: "My Applications",
      url: "/dashboard/student/my-applications",
      icon: BookOpen,
    },
    {
      name: "Update Profile",
      url: "/dashboard/profile",
      icon: User,
    },
  ],

  tutor: [
    {
      name: "Tutor Dashboard",
      url: "/dashboard/tutor",
      icon: LayoutDashboard,
    },
    {
      name: "Post Tuition",
      url: "/dashboard/tutor/post-tuition",
      icon: PlusCircle,
    },
    {
      name: "My Tuitions",
      url: "/dashboard/tutor/my-tuitions",
      icon: BookOpen,
    },
    {
      name: "Applicants",
      url: "/dashboard/tutor/applicants",
      icon: Users,
    },
    {
      name: "Update Profile",
      url: "/dashboard/profile",
      icon: User,
    },
  ],

  admin: [
    {
      name: "Admin Dashboard",
      url: "/dashboard/admin",
      icon: ShieldCheck,
    },
    {
      name: "Manage Users",
      url: "/dashboard/admin/users",
      icon: Users,
    },
    {
      name: "Manage Tuitions",
      url: "/dashboard/admin/tuitions",
      icon: GraduationCap,
    },
    {
      name: "Transactions",
      url: "/dashboard/admin/transactions",
      icon: ClipboardList,
    },
    {
      name: "Update Profile",
      url: "/dashboard/profile",
      icon: Settings,
    },
  ],
}

export function DashboardSidebar() {
  const { data: session, isPending } = useSession()

  const role = session?.user?.role as Role | undefined

  const projects= role ? menuItemByRole[role] : []

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="px-3 py-2 text-xl font-bold">
          MentorLagbe
        </h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {projects.map((project) => (
              <SidebarMenuItem key={project.name}>
                <SidebarMenuButton
                  render={<a href={project.url} />}
                >
                  <project.icon />
                  <span>{project.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {isPending ? "Loading..." : null}
      </SidebarFooter>
    </Sidebar>
  )
}
