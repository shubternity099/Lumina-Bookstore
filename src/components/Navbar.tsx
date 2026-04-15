import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book, LogIn, LogOut, User, PlusCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-[#121212]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-[2px] text-primary uppercase">
          <Book className="h-5 w-5" />
          <span>Lumina.</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <div className="flex items-center gap-3 ml-4 border-l border-border pl-4">
                <span className="text-[13px] font-medium hidden sm:inline">{user.name}</span>
                <div className="h-8 w-8 rounded-full gradient-gold" />
                <Button variant="ghost" size="icon" onClick={onLogout} title="Logout" className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Button asChild className="btn-primary h-9 px-6">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
