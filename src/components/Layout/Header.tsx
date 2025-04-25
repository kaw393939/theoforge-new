'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose, 
  SheetHeader, 
  SheetTitle, 
} from "@/components/ui/sheet";
import { MenuIcon } from 'lucide-react';
import Button from '@/components/Common/Button';

const Header: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Insights", path: "/insights" },
    { label: "The Forge", path: "/forge" }, 
    { label: "Community", path: "/community" },
    { label: "Contact", path: "/contact" },
  ];

  const authItems = [
    { label: "Sign In", path: "/login", primary: true },
    { label: "Register", path: "/register", primary: false },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-white/95 dark:bg-neutral-950/95",
        "backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60"
      )}
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo and Name */}
        <Link href="/" className="flex items-center shrink-0 mr-4">
          <Image
            className="dark:invert"
            src="/logo.png"
            alt="TheoForge Logo"
            width={60} 
            height={16}
            priority
          />
          <span className="ml-2 font-poppins font-semibold text-lg text-foreground dark:text-foreground-dark hidden sm:inline">
            TheoForge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex sm:gap-4 lg:gap-6 flex-grow justify-center">
           {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "text-sm font-semibold transition-colors hover:text-black",
                pathname === item.path ? "text-black underline" : "text-black/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* Auth Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {authItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "text-sm font-bold px-4 py-2 rounded-lg transition-all duration-300",
                item.primary 
                  ? "bg-black text-white hover:bg-black/80 shadow-sm hover:shadow-md" 
                  : "border-2 border-black text-black hover:bg-black/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Navigation Trigger (Hamburger Menu) */}
        <div className="sm:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm p-6">
              {/* Optional Sheet Header */}
              <SheetHeader className="mb-6">
                <SheetTitle>
                  <Link href="/" className="flex items-center" onClick={(e) => (e.target as HTMLElement).closest<HTMLElement>('[data-radix-sheet-close]')?.click()}>
                     <Image
                        className="dark:invert mr-2"
                        src="/logo.png"
                        alt="TheoForge Logo"
                        width={45} // Slightly smaller logo in sheet
                        height={12}
                        priority
                      />
                      <span className="font-poppins font-semibold text-lg text-foreground dark:text-foreground-dark">
                        TheoForge
                      </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-4 overflow-y-auto">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.path}
                      className={cn(
                        "block py-2 text-sm font-semibold transition-colors hover:text-black",
                        pathname === item.path ? "text-black underline" : "text-black/70"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                
                <div className="border-t border-border/40 mt-4 pt-4">
                  {authItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Link
                        href={item.path}
                        className={cn(
                          "block py-3 px-4 text-sm font-bold my-3 rounded-lg text-center transition-all shadow-sm",
                          item.primary 
                            ? "bg-black text-white hover:bg-black/80" 
                            : "border-2 border-black text-black hover:bg-black/5"
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Auth buttons are now in their own section above */}
      </div>
    </header>
  );
};

export default Header;
