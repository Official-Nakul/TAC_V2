import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Chat from "../chat/Page";
import { AddApiForm } from "../apiForm/Page";

export default function Page() {
  const [activeView, setActiveView] = useState("Ask AI");

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar onNavItemClick={setActiveView} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <h1 className="text-lg font-medium">{activeView}</h1>

              {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
            </div>
            <div className="ml-auto px-3 flex items-center gap-2">
              <ThemeToggle />
              {/* <NavActions /> */}
            </div>
          </header>
          {activeView === "Ask AI" ? (
            <Chat />
          ) : activeView === "Add API" ? (
            <AddApiForm />
          ) : null}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
