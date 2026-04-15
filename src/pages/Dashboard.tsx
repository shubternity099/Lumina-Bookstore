import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Book as BookIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard({ user }: { user: any }) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        toast.success("Book deleted successfully");
        fetchBooks();
      } else {
        toast.error("Failed to delete book");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your bookstore inventory</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/add-book">
            <Plus className="mr-2 h-4 w-4" /> Add New Book
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#121212] border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{books.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#121212] border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">124</div>
          </CardContent>
        </Card>
        <Card className="bg-[#121212] border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,450</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-[#121212] shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">Inventory List</CardTitle>
          <CardDescription className="text-muted-foreground">A list of all books currently in the store.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-black/20">
                <tr>
                  <th className="px-6 py-4 font-semibold">Book</th>
                  <th className="px-6 py-4 font-semibold">Author</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-8 bg-muted/20"></td>
                    </tr>
                  ))
                ) : books.map((book) => (
                  <tr key={book.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-8 rounded overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                          <img 
                            src={book.image_url || `https://picsum.photos/seed/${book.id}/400/600`} 
                            alt="" 
                            className="h-full w-full object-cover opacity-80"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-semibold text-foreground">{book.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{book.author}</td>
                    <td className="px-6 py-4 font-mono font-medium text-primary">${book.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="View" className="text-muted-foreground hover:text-primary">
                          <Link to={`/book/${book.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Edit" className="text-muted-foreground hover:text-foreground">
                          <Link to={`/edit-book/${book.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(book.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
