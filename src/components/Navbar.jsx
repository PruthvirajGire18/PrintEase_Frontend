import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  Upload,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navItemBase =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isLoggedIn = Boolean(user.token);

  const handleLogout = () => {
    const redirectPath = logout();
    setOpen(false);
    navigate(redirectPath);
  };

  const getLinkClassName = (path) =>
    `${navItemBase} ${
      location.pathname === path
        ? "bg-white text-slate-950 shadow-lg"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const commonLinks = isLoggedIn
    ? [
        { to: "/upload", icon: Upload, label: "Upload" },
        { to: "/track", icon: Search, label: "Track" },
      ]
    : [];

  const roleLinks =
    user.role === "admin"
      ? [{ to: "/admin", icon: Shield, label: "Admin" }]
      : user.role === "user"
        ? [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }]
        : [];

  const allLinks = [...commonLinks, ...roleLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)] text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)]">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white md:text-xl">
              PrintEase
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Online Print Ops
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {allLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to} className={getLinkClassName(link.to)}>
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className={`${navItemBase} secondary-btn`}>
                <User size={16} />
                Login
              </Link>
              <Link to="/signup" className={`${navItemBase} primary-btn`}>
                Create account
              </Link>
            </>
          ) : (
            <>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                <span className="text-slate-400">Signed in as</span>{" "}
                <span className="font-semibold text-white">{user.name || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className={`${navItemBase} danger-btn`}
                type="button"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950/96 px-4 py-4 md:hidden">
          <div className="mx-auto max-w-7xl space-y-3">
            {isLoggedIn && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Signed in
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {user.name || "User"}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              {!isLoggedIn && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="secondary-btn inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                  >
                    <User size={16} />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="primary-btn inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                  >
                    <User size={16} />
                    Create account
                  </Link>
                </>
              )}

              {allLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={getLinkClassName(link.to)}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  type="button"
                  className="danger-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
