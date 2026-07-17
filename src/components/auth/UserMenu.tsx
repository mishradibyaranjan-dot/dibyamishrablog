import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  // Login is currently hidden for public browsing; direct /auth still works when needed.
  if (!user) {
    return null;
  }

  const initial = (user.user_metadata?.full_name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-neon"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/learn"><UserIcon className="mr-2 h-4 w-4" /> Learn</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/reports"><LayoutDashboard className="mr-2 h-4 w-4" /> Reports</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
