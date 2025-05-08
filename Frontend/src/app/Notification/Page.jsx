import React, { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New message received",
      description: "You have received a new message from John Doe",
      timestamp: "2 minutes ago",
      read: false,
      type: "message",
    },
    {
      id: 2,
      title: "System update",
      description: "The system has been updated to version 2.0",
      timestamp: "1 hour ago",
      read: true,
      type: "system",
    },
    {
      id: 3,
      title: "Task completed",
      description: 'Your task "Create presentation" has been completed',
      timestamp: "3 hours ago",
      read: false,
      type: "task",
    },
    {
      id: 4,
      title: "Meeting reminder",
      description: "You have a meeting with the team at 3:00 PM",
      timestamp: "5 hours ago",
      read: true,
      type: "reminder",
    },
    {
      id: 5,
      title: "New feature available",
      description: "Check out the new features in the latest update",
      timestamp: "1 day ago",
      read: true,
      type: "system",
    },
  ]);

  const [filter, setFilter] = useState("all");

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((notification) => !notification.read)
      : notifications.filter((notification) => notification.type === filter);

  const getTypeColor = (type) => {
    switch (type) {
      case "message":
        return "default";
      case "system":
        return "secondary";
      case "task":
        return "destructive";
      case "reminder":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <ThemeProvider>
      <SidebarProvider>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <div className="flex items-center gap-2">
                <Badge
                  className={`cursor-pointer ${
                    filter === "all" ? "bg-primary" : "bg-secondary"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All
                </Badge>
                <Badge
                  className={`cursor-pointer ${
                    filter === "unread" ? "bg-primary" : "bg-secondary"
                  }`}
                  onClick={() => setFilter("unread")}
                >
                  Unread ({notifications.filter((n) => !n.read).length})
                </Badge>
                <Badge
                  className={`cursor-pointer ${
                    filter === "message" ? "bg-primary" : "bg-secondary"
                  }`}
                  onClick={() => setFilter("message")}
                >
                  Messages
                </Badge>
                <Badge
                  className={`cursor-pointer ${
                    filter === "system" ? "bg-primary" : "bg-secondary"
                  }`}
                  onClick={() => setFilter("system")}
                >
                  System
                </Badge>
              </div>
            </div>
          </header>

          <div className="p-4">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search notifications..."
                className="max-w-sm"
              />
            </div>

            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No notifications found
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`${
                      !notification.read ? "border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary"></span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {notification.timestamp}
                          </CardDescription>
                        </div>
                        <Badge variant={getTypeColor(notification.type)}>
                          {notification.type.charAt(0).toUpperCase() +
                            notification.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{notification.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-xs text-muted-foreground">
                        {notification.read ? "Read" : "Unread"}
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default Notifications;
