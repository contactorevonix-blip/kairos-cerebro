"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, ChevronDown, Zap, Code2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navLinks = [
  {
    label: "Product",
    href: "#",
    dropdown: [
      { label: "Live Demo",      href: "#demo",     icon: Zap,       desc: "Try KAIROS in real-time" },
      { label: "API",            href: "#api",      icon: Code2,     desc: "B2B REST API & SDKs" },
      { label: "Enterprise",     href: "#enterprise",icon: Building2, desc: "Custom SLA & white-label" },
    ],
  },
  { label: "Pricing",  href: "#pricing" },
  { label: "Docs",     href: "/docs" },
  { label: "Blog",     href: "/blog" },
];

export default function Nav() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown]     = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/8 shadow-lg"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 md:px-6 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
              <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500/30 to-violet-600/20 rounded-xl border border-blue-500/30">
                <Shield className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-semibold text-base text-gray-12 tracking-tight">KAIROS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setDropdown(link.label)}
                  onMouseLeave={() => setDropdown(null)}
                >
                  <button className="flex items-center gap-1 h-9 px-3 text-sm text-gray-11 hover:text-gray-12 transition-colors duration-200 rounded-xl hover:bg-white/5">
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        dropdown === link.label && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 pt-2"
                      >
                        <div className="glass rounded-2xl p-2 min-w-[240px] shadow-card">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-150 group/item"
                            >
                              <div className="icon-box w-9 h-9 mt-0.5 shrink-0">
                                <item.icon className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-12">{item.label}</div>
                                <div className="text-xs text-gray-10 mt-0.5">{item.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="h-9 px-3 text-sm text-gray-11 hover:text-gray-12 transition-colors duration-200 inline-flex items-center rounded-xl hover:bg-white/5"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="accent" className="mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              5 free checks/day
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="#demo">Try free</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-gray-11"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] z-40 glass-strong border-b border-white/8 p-4"
          >
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href ?? "#"}
                  className="px-4 py-3 text-sm text-gray-11 hover:text-gray-12 hover:bg-white/5 rounded-xl transition-colors duration-150"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="#demo">Try free — 5 checks/day</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
