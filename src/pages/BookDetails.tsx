import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, BookOpen, User, DollarSign, Info, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import { cn } from '@/lib/utils';

const StarRating = ({ rating, onRatingChange, interactive = false }: { rating: number, onRatingChange?: (r: number) => void, interactive?: boolean }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 transition-colors",
            star <= rating ? "fill-primary text-primary" : "text-muted-foreground",
            interactive && "cursor-pointer hover:text-primary"
          )}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage (simplified auth check)
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bookRes = await fetch(`/api/books/${id}`);
        if (!bookRes.ok) throw new Error("Book not found");
        const bookData = await bookRes.json();
        setBook(bookData);

        // Fetch reviews
        const reviewsRes = await fetch(`/api/books/${id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);

        const allBooksRes = await fetch('/api/books');
        const allBooks = await allBooksRes.json();
        
        const related = allBooks
          .filter((b: any) => b.author === bookData.author && b.id !== bookData.id)
          .slice(0, 4);
        
        if (related.length < 4) {
          const others = allBooks
            .filter((b: any) => b.author !== bookData.author && b.id !== bookData.id)
            .slice(0, 4 - related.length);
          setRelatedBooks([...related, ...others]);
        } else {
          setRelatedBooks(related);
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) return null;

  const handleAddToCart = () => {
    addToCart(book);
    toast.success(`${book.title} added to cart!`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) {
      toast.error("Please login to leave a review");
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/books/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(newReview)
      });

      if (res.ok) {
        const addedReview = await res.json();
        setReviews([addedReview, ...reviews]);
        setNewReview({ rating: 5, comment: "" });
        toast.success("Review added successfully!");
      } else {
        toast.error("Failed to add review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left: Book Cover */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-5"
        >
          <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-border bg-[#1a1a1a] shadow-2xl relative group">
            <img 
              src={book.image_url || `https://picsum.photos/seed/${book.id}/600/900`} 
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </motion.div>

        {/* Right: Book Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-7 flex flex-col justify-center space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="tag">Premium Edition</span>
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(Number(averageRating))} />
                <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              {book.title}
            </h1>
            <div className="flex items-center gap-2 text-primary font-medium text-lg">
              <User className="h-5 w-5" />
              <span>{book.author}</span>
            </div>
          </div>

          <Card className="bg-[#121212] border-border shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  <Info className="h-3 w-3" />
                  <span>Description</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description || "No description available for this masterpiece. Immerse yourself in the world created by the author and discover the secrets hidden within these pages."}
                </p>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Price</span>
                  <div className="text-3xl font-bold text-primary flex items-center">
                    <DollarSign className="h-6 w-6" />
                    {book.price.toFixed(2)}
                  </div>
                </div>
                <Button 
                  onClick={handleAddToCart}
                  className="btn-primary h-12 px-8 rounded-full text-sm uppercase tracking-widest"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#121212] border border-border p-4 rounded-xl text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Format</span>
              <span className="text-sm font-semibold">Hardcover</span>
            </div>
            <div className="bg-[#121212] border border-border p-4 rounded-xl text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Language</span>
              <span className="text-sm font-semibold">English</span>
            </div>
            <div className="bg-[#121212] border border-border p-4 rounded-xl text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Pages</span>
              <span className="text-sm font-semibold">320</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-primary">{averageRating}</div>
              <div className="space-y-1">
                <StarRating rating={Math.round(Number(averageRating))} />
                <p className="text-xs text-muted-foreground">Based on {reviews.length} reviews</p>
              </div>
            </div>
          </div>

          <Card className="bg-[#121212] border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rating</label>
                  <StarRating 
                    rating={newReview.rating} 
                    interactive 
                    onRatingChange={(r) => setNewReview({ ...newReview, rating: r })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Comment</label>
                  <textarea
                    className="w-full bg-[#1e1e1e] border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                    placeholder="Share your thoughts about this book..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="btn-primary w-full" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {reviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#121212] rounded-2xl border border-border border-dashed">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#121212] border border-border p-6 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-gold flex items-center justify-center text-black font-bold text-xs">
                        {review.user_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{review.user_name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-24 space-y-8"
        >
          <div className="flex items-end justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Related Masterpieces</h2>
              <p className="text-muted-foreground text-sm">Discover more works by this author and similar titles.</p>
            </div>
            <Link to="/" className="text-primary text-xs font-semibold hover:underline uppercase tracking-widest">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relatedBook, index) => (
              <motion.div
                key={relatedBook.id}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link to={`/book/${relatedBook.id}`} className="group block space-y-3">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden border border-border bg-[#1a1a1a] relative shadow-lg">
                    <img 
                      src={relatedBook.image_url || `https://picsum.photos/seed/${relatedBook.id}/400/600`} 
                      alt={relatedBook.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {relatedBook.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{relatedBook.author}</p>
                    <p className="text-sm font-bold text-primary">${relatedBook.price.toFixed(2)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
