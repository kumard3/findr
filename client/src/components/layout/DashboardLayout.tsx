import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <SidebarProvider >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// return (
//   <div className="min-h-screen bg-gray-50">
//     <div className="flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r min-h-screen p-4 space-y-4">
//         <div className="mb-8">
//           <Link href="/">
//             <img src="/logo.png" alt="Logo" className="h-8" />
//           </Link>
//         </div>
//         <nav className="space-y-2">
//           <Link href="/dashboard">
//             <Button
//               variant={isActive("/dashboard") ? "secondary" : "ghost"}
//               className="w-full justify-start"
//             >
//               Overview
//             </Button>
//           </Link>
//           <Link href="/dashboard/collections">
//             <Button
//               variant={
//                 isActive("/dashboard/collections") ? "secondary" : "ghost"
//               }
//               className="w-full justify-start"
//             >
//               Collections
//             </Button>
//           </Link>
//           <Link href="/dashboard/documents">
//             <Button
//               variant={
//                 isActive("/dashboard/documents") ? "secondary" : "ghost"
//               }
//               className="w-full justify-start"
//             >
//               Documents
//             </Button>
//           </Link>
//           <Link href="/dashboard/api-keys">
//             <Button
//               variant={
//                 isActive("/dashboard/api-keys") ? "secondary" : "ghost"
//               }
//               className="w-full justify-start"
//             >
//               API Keys
//             </Button>
//           </Link>
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 p-8">{children}</div>
//     </div>
//   </div>
// );
