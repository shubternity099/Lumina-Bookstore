import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="h-24 w-24 rounded-full bg-[#121212] flex items-center justify-center border border-border">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added any masterpieces to your collection yet.</p>
        </div>
        <Button asChild className="btn-primary px-8 rounded-full">
          <Link to="/">Start Exploring</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Your Collection</h1>
        <p className="text-muted-foreground">You have {totalItems} items in your shopping cart.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-[#121212] border-border overflow-hidden group">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                  <div className="h-40 w-28 rounded-lg overflow-hidden bg-[#2a2a2a] flex-shrink-0 shadow-lg">
                    <img 
                      src={item.image_url || `https://picsum.photos/seed/${item.id}/400/600`} 
                      alt={item.title}
                      className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link to={`/book/${item.id}`} className="hover:text-primary transition-colors">
                          <h3 className="text-lg font-bold leading-tight">{item.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{item.author}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-6 sm:mt-0">
                      <div className="flex items-center gap-1 bg-black/30 rounded-full p-1 border border-border">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <Card className="bg-[#121212] border-border sticky top-24 shadow-2xl">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button className="btn-primary w-full h-12 rounded-full uppercase tracking-widest text-xs font-bold">
                Checkout Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                Secure checkout powered by Lumina Pay
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
