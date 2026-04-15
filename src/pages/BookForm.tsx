import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Book, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    description: "",
    image_url: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/books/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title,
            author: data.author,
            price: data.price.toString(),
            description: data.description || "",
            image_url: data.image_url || ""
          });
        })
        .catch(() => toast.error("Failed to fetch book details"));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isEdit ? `/api/books/${id}` : '/api/books';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (res.ok) {
        toast.success(isEdit ? "Book updated successfully" : "Book added successfully");
        navigate('/dashboard');
      } else {
        const data = await res.json();
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border bg-[#121212] shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Book className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl">{isEdit ? "Edit Book" : "Add New Book"}</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              {isEdit ? "Update the details of the existing book." : "Fill in the details to add a new book to the collection."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Book Title</Label>
                  <Input 
                    id="title" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-[#1e1e1e] border-border h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Author</Label>
                  <Input 
                    id="author" 
                    required 
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="bg-[#1e1e1e] border-border h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#1e1e1e] border-border h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Image URL (Optional)</Label>
                  <div className="relative">
                    <Input 
                      id="image_url" 
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-[#1e1e1e] border-border h-11 pl-10"
                    />
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description</Label>
                <textarea 
                  id="description" 
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-md border border-border bg-[#1e1e1e] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="border-border hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="btn-primary">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : (isEdit ? "Update Book" : "Add Book")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
