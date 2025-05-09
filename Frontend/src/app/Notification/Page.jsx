import React, { useState, useEffect, useRef } from "react";
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
import { setupHourlyWeatherNotifications } from "../../../utils/WeatherNotification";
import { Button } from "@/components/ui/button";
import { CloudSun, AlertTriangle } from "lucide-react";

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
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [weatherCity, setWeatherCity] = useState("gandhinagar");
  const [weatherUnits, setWeatherUnits] = useState("metric");
  const [intervalMinutes, setIntervalMinutes] = useState(60); // Default to 60 minutes
  const [weatherError, setWeatherError] = useState(null);
  const weatherNotifierRef = useRef(null);

  // Function to add a new notification
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);

    // Clear any previous error if we get a successful notification
    if (notification.type === "weather") {
      setWeatherError(null);
    }

    // Set error state if there's an error notification
    if (
      notification.type === "system" &&
      notification.title.includes("Error")
    ) {
      setWeatherError(notification.description);
    }
  };

  // Setup and cleanup weather notifications
  useEffect(() => {
    if (weatherEnabled) {
      // Validate city before starting
      if (!weatherCity || weatherCity.trim() === "") {
        setWeatherError("Please enter a valid city name");
        return;
      }

      // Clear any previous error
      setWeatherError(null);

      // Create new notifier with current settings
      const notifier = setupHourlyWeatherNotifications(
        addNotification,
        weatherCity,
        weatherUnits,
        intervalMinutes // Pass the custom interval
      );

      // Start the notification service
      notifier.start();
      weatherNotifierRef.current = notifier;

      // Add initial notification about weather service
      addNotification({
        id: Date.now(),
        title: "Weather Notifications Enabled",
        description: `You will now receive weather updates for ${weatherCity} every ${intervalMinutes} ${
          intervalMinutes === 1 ? "minute" : "minutes"
        }.`,
        timestamp: new Date().toLocaleTimeString(),
        read: false,
        type: "system",
      });

      return () => {
        // Clean up on unmount or when disabled
        if (weatherNotifierRef.current) {
          weatherNotifierRef.current.stop();
          weatherNotifierRef.current = null;
        }
      };
    } else if (weatherNotifierRef.current) {
      // Stop notifications if disabled
      weatherNotifierRef.current.stop();
      weatherNotifierRef.current = null;

      // Add disabled notification
      addNotification({
        id: Date.now(),
        title: "Weather Notifications Disabled",
        description: "Weather notifications have been turned off.",
        timestamp: new Date().toLocaleTimeString(),
        read: false,
        type: "system",
      });
    }
  }, [weatherEnabled, weatherCity, weatherUnits, intervalMinutes]);

  // Function to restart weather notifications with new settings
  const updateWeatherSettings = () => {
    if (weatherEnabled && weatherNotifierRef.current) {
      // Stop current notifications
      weatherNotifierRef.current.stop();
      weatherNotifierRef.current = null;

      // Re-enable to trigger useEffect with new settings
      setWeatherEnabled(false);
      setTimeout(() => setWeatherEnabled(true), 100);
    }
  };

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
        return "default"; // Primary color
      case "system":
        return "secondary"; // Secondary color
      case "task":
        return "destructive"; // Red/destructive color
      case "reminder":
        return "outline"; // Subtle outline style
      case "weather":
        return "blue"; // Blue color for weather
      case "weather-alert":
        return "destructive"; // Red color for weather alerts
      default:
        return "default";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "weather":
      case "weather-alert":
        return <CloudSun className="h-5 w-5 text-blue-500" />;
      case "system":
        return weatherError ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <SidebarProvider>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={filter === "all" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setFilter("all")}
                >
                  All
                </Badge>
                <Badge
                  variant={filter === "unread" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setFilter("unread")}
                >
                  Unread ({notifications.filter((n) => !n.read).length})
                </Badge>
                <Badge
                  variant={filter === "message" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setFilter("message")}
                >
                  Messages
                </Badge>
                <Badge
                  variant={filter === "system" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setFilter("system")}
                >
                  System
                </Badge>
                <Badge
                  variant={filter === "weather" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => setFilter("weather")}
                >
                  Weather
                </Badge>
              </div>
            </div>
          </header>

          {/* Weather Notification Controls */}
          <div className="px-4 py-2 border-b">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Weather Notifications</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={weatherEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeatherEnabled(!weatherEnabled)}
                >
                  {weatherEnabled ? "Disable" : "Enable"}
                </Button>

                <Input
                  type="text"
                  placeholder="Enter city name"
                  value={weatherCity}
                  onChange={(e) => setWeatherCity(e.target.value)}
                  className="w-32 h-8 text-sm"
                  disabled={!weatherEnabled}
                />

                <select
                  value={weatherUnits}
                  onChange={(e) => setWeatherUnits(e.target.value)}
                  className="h-8 text-sm border rounded px-2"
                  disabled={!weatherEnabled}
                >
                  <option value="metric">°C</option>
                  <option value="imperial">°F</option>
                </select>

                <select
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
                  className="h-8 text-sm border rounded px-2"
                  disabled={!weatherEnabled}
                >
                  <option value="1">1 min (demo)</option>
                  <option value="5">5 min</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                </select>

                {weatherEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={updateWeatherSettings}
                  >
                    Update
                  </Button>
                )}
              </div>
            </div>

            {/* Show error if there is one */}
            {weatherError && (
              <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {weatherError}
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search notifications..."
                className="max-w-sm bg-background border-border focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card className="border border-dashed bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No notifications found
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`${
                      !notification.read
                        ? "border-l-4 border-l-primary shadow-sm"
                        : ""
                    } transition-all hover:shadow-md`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getTypeIcon(notification.type)}
                            {notification.title}
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
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
                      <div className="flex items-start gap-2">
                        {notification.icon && (
                          <img
                            src={notification.icon}
                            alt="Weather icon"
                            className="w-10 h-10"
                          />
                        )}
                        <p>{notification.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {notification.read ? (
                          "Read"
                        ) : (
                          <span className="flex items-center gap-1 text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                            Unread
                          </span>
                        )}
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
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
