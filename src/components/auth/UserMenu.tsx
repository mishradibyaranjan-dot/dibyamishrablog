import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, LogIn, LayoutDashboard, Mail, User as UserIcon, ShieldBan, ScrollText, ShieldAlert, BookLock } from "lucide-react";
import { useAuth } from "@/lib/auth";
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

  if (!user) {
    return (
      <Link
        to="/auth"
        search={{ mode: "login" }}
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <LogIn className="h-4 w-4" /> Sign in
      </Link>
    );
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
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/contact-enquiries"><Mail className="mr-2 h-4 w-4" /> Contact enquiries</Link>
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/blocked-domains"><ShieldBan className="mr-2 h-4 w-4" /> Blocked domains</Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/spam-audit"><ScrollText className="mr-2 h-4 w-4" /> Spam audit log</Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/security-events"><ShieldAlert className="mr-2 h-4 w-4" /> Security events</Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/visitor-audit"><ScrollText className="mr-2 h-4 w-4" /> Visitor tracking audit</Link>
          </DropdownMenuItem>
        )}
        {isAdmin && user.email?.trim().toLowerCase() === "mishra.dibyaranjan@gmail.com" && (
          <DropdownMenuItem asChild>
            <Link to="/admin/docs"><BookLock className="mr-2 h-4 w-4" /> Engineering docs</Link>
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
