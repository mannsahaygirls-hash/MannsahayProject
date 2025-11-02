import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  User,
  History,
  BookOpen,
  UserCircle,
  Heart,
  Activity,
  Users,
  LogOut,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig"; // ✅ Import Firebase auth

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [connectOpen, setConnectOpen] = useState(false);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userDetailsTimeoutRef = useRef<NodeJS.Timeout>();

  let userDetailsTimeout: NodeJS.Timeout;

  const handleUserDetailsEnter = () => {
    clearTimeout(userDetailsTimeout);
    userDetailsTimeout = setTimeout(() => setUserDetailsOpen(true), 120);
  };

  const handleUserDetailsLeave = () => {
    clearTimeout(userDetailsTimeout);
    userDetailsTimeout = setTimeout(() => setUserDetailsOpen(false), 150);
  };

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to Auth page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { path: "/home", label: "Home", emoji: "🌿" },
    { path: "/chat", label: "MannMitra", emoji: "👥" },
    { path: "/mannmitra", label: "MannSahay", emoji: "💬 " },
    { path: "/activities", label: "Activity Zone", emoji: "🎯" },
    { path: "/offline", label: "Offline", emoji: "✈️" },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/home"
            className="flex items-center space-x-2 font-bold text-lg text-wellness-primary"
          >
            <span className="text-2xl">🌿</span>
            <span>MannSahay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-wellness-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-wellness-calm/30"
                )}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Connect Dropdown */}
            <DropdownMenu open={connectOpen} onOpenChange={setConnectOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-wellness-calm/30"
                  onMouseEnter={() => setConnectOpen(true)}
                  onMouseLeave={() => setConnectOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  <span>Connect</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-card/95 backdrop-blur-sm"
                onMouseEnter={() => setConnectOpen(true)}
                onMouseLeave={() => setConnectOpen(false)}
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/session-therapy"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Session Therapy</div>
                      <div className="text-xs text-muted-foreground">
                        Professional support
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/chat-anyone"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Chat with Anyone</div>
                      <div className="text-xs text-muted-foreground">
                        Anonymous peer support
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Account Dropdown */}
          <div className="hidden md:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-card/95 backdrop-blur-sm"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    to="/history"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </Link>
                </DropdownMenuItem>

                {/* User Details Submenu */}
                <DropdownMenu open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
                  <DropdownMenuTrigger asChild>
                    <div
                      className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      onMouseEnter={handleUserDetailsEnter}
                      onMouseLeave={handleUserDetailsLeave}
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      <span>User Details</span>
                      <ChevronRight className="ml-auto w-3 h-3 opacity-70" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={-5}
                    className="w-56 bg-card/95 backdrop-blur-sm"
                    onMouseEnter={handleUserDetailsEnter}
                    onMouseLeave={handleUserDetailsLeave}
                  >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Personal Details
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile?section=personal"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>Name & Contact</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Health Details
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile?section=health"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Health Information</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  <Link
                    to="/incognito"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                  <span>Incognito Mode</span>
                  </Link>
                </DropdownMenuItem>

                {/* ✅ Working Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[350px] bg-card overflow-y-auto max-h-screen"
              >
                <div className="flex flex-col gap-4 mt-8">
                  {/* Main Navigation */}
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                          location.pathname === item.path
                            ? "bg-wellness-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-wellness-calm/30"
                        )}
                      >
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Account Section */}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground px-4 mb-2">
                      My Account
                    </p>
                    <Link
                      to="/history"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-wellness-calm/30"
                    >
                      <History className="w-4 h-4" />
                      <span>History</span>
                    </Link>

                    {/* ✅ Mobile Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
