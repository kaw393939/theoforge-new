'use client';

import React, { useContext, useEffect } from 'react';
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
import { LogOut, MenuIcon, User } from 'lucide-react';
import Button from '@/components/Common/Button';
import { AuthContext } from '../Dashboard/AppContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const Header: React.FC = () => {
  const { isAuthenticated, user, logout, accessTokenLogin } = useContext(AuthContext);
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
  
  const loadAccount = async () => {
    try {
      // Try login using cookie access token
      let token = "";
      const field = "accessToken=";
      const pairs = decodeURIComponent(document.cookie).split(';');
      for(let i = 0; i <pairs.length; i++) {
        let c = pairs[i];
        // Remove leading whitespace
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(field) == 0) {
          token = c.substring(field.length, c.length);
        }
      }
      if(token) {
        await accessTokenLogin(token);
      }
    } catch {
      console.error("User not found");
    }
  }

  useEffect(() => {
    loadAccount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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
        <nav className="hidden md:flex sm:gap-2 lg:gap-4 flex-grow justify-center">
           {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.path ? "text-primary dark:text-primary-light" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Authentication UI */}
        <div className="hidden md:flex items-center space-x-2 ml-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 px-3">
                  <span className="hidden md:inline-block">
                    {
                      user.nickname ? user.nickname :
                      (user.first_name && user.last_name) ? (user.first_name + ' ' + user.last_name) :
                      user.role ? user.role : "USER"
                    }
                  </span>
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {
                        user.nickname ? user.nickname :
                        (user.first_name && user.last_name) ? (user.first_name + ' ' + user.last_name) :
                        user.role ? user.role : "USER"
                      }
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="text-xs lg:text-sm bg-black hover:bg-black/80 text-white transition-all duration-300"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="text-xs lg:text-sm bg-primary hover:bg-primary/80 text-white transition-all duration-300"
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Navigation Trigger (Hamburger Menu) */}
        <div className="md:hidden flex items-center">
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
                        "block py-2 text-sm font-medium transition-colors hover:text-primary",
                        pathname === item.path ? "text-primary dark:text-primary-light" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                
                {/* Mobile Authentication UI */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  {isAuthenticated ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="block py-2 text-sm font-medium transition-colors hover:text-primary"
                        >
                          Dashboard
                        </Link>
                      </SheetClose>
                      <button
                        onClick={logout}
                        className="flex items-center w-full py-2 text-sm font-medium text-red-500 transition-colors hover:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link href="/login" className="w-32">
                          <Button
                            className="w-full ml-2 bg-black hover:bg-black/80 text-white transition-all duration-300"
                          >
                            Log in
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/register" className="w-32">
                          <Button
                            className="w-full ml-2 bg-primary hover:bg-primary/80 text-white transition-all duration-300"
                          >
                            Sign up
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Optional: Placeholder for CTA button if needed on desktop */}
        {/* <div className="hidden sm:flex items-center"> */}
        {/*   <Button>Contact Us</Button> */}
        {/* </div> */}
      </div>
    </header>
  );
};

export default Header;
