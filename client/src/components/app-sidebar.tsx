import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { FileText, Key, Database } from "lucide-react";

const data = {
  navMain: [
    {
      title: "Collections",
      href: "/dashboard/collections",
      icon: Database,
    },
    {
      title: "Documents",
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "API Keys",
      href: "/dashboard/api-keys",
      icon: Key,
    },
  ],
  user: {
    name: "John Doe",
    email: "john@example.com",
    image: "https://github.com/shadcn.png",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Findr</span>
                  <span className="truncate text-xs">Semantic Search</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <a href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" className="flex items-center gap-3">
                <img
                  src={data.user.image}
                  alt={data.user.name}
                  className="size-6 rounded-full"
                />
                <div className="grid flex-1">
                  <span className="font-medium">{data.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {data.user.email}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
