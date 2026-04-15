import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <section className="relative h-[240px] rounded-2xl overflow-hidden border border-border flex flex-col justify-center px-12 bg-[#1a1a1a]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        <div className="relative z-20 space-y-4">
          <span className="tag w-fit">Featured Selection</span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold"
          >
            The Architecture of Light
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm max-w-md leading-relaxed"
          >
            Discover the definitive guide to modern minimalist design and structural illumination.
          </motion.p>
          <Button className="btn-primary w-fit mt-4">Explore Collection</Button>
        </div>
      </section>

      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">Trending Literature</h2>
          <div className="max-w-xs relative flex-1 ml-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for titles, authors..." 
              className="pl-10 h-10 bg-[#1e1e1e] border-border text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-primary text-xs font-semibold cursor-pointer ml-4">View All Books</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[320px] rounded-xl bg-[#121212] border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-[#121212] border-border p-4 h-full flex flex-col group hover:border-primary/30 transition-colors">
                  <Link to={`/book/${book.id}`} className="block">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#2a2a2a] mb-4 relative">
                      <img 
                        src={book.image_url || `https://picsum.photos/seed/${book.id}/400/600`} 
                        alt={book.title}
                        className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1 mb-4">
                      <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{book.title}</h3>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                  </Link>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-primary">${book.price.toFixed(2)}</span>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-[11px] border-border hover:bg-white/5">
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
