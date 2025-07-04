/* eslint-disable react/jsx-no-undef */
import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { trackingAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

const FeedbackForm = ({ trackingCode, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await trackingAPI.submitFeedback(trackingCode, { rating, comment });
      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      // Close after 2 seconds
      setTimeout(onClose, 2000);
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">
            Your feedback helps us improve our service.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rate Your Experience</CardTitle>
            <CardDescription>
              How was your delivery experience?
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {rating > 0 && (
                rating === 5 ? 'Excellent!' :
                rating === 4 ? 'Good' :
                rating === 3 ? 'Average' :
                rating === 2 ? 'Poor' :
                'Very Poor'
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comments (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
