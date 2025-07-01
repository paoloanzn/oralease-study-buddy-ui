
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Upload, Mic, FileText, Calendar, Plus, BarChart3, Crown, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { CreateNoteModal } from "@/components/CreateNoteModal";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { useNotes } from "@/hooks/useNotes";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { STRIPE_CONFIG } from "@/config/stripe";

const Home = () => {
  const navigate = useNavigate();
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { notes, isLoading: isLoadingNotes } = useNotes();
  const { isSubscribed, subscriptionTier, subscriptionEnd, manageSubscription, loading } = useSubscription();

  // Fetch recent exams
  const { data: recentExams = [] } = useQuery({
    queryKey: ['recent-exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const getRatingFromScore = (percentage: number | null) => {
    if (!percentage) return "Not Scored";
    if (percentage >= 80) return "Excellent";
    if (percentage >= 70) return "Good";
    return "Needs Improvement";
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "text-green-600";
      case "Good":
        return "text-blue-600";
      case "Needs Improvement":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return "1 week ago";
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to MedNexusOS!</h1>
          <p className="text-gray-600">Your comprehensive medical exam preparation platform</p>
        </div>

        {/* Subscription Status */}
        {!loading && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  <Crown className="mr-2 h-5 w-5" />
                  Subscription Status
                </div>
                {STRIPE_CONFIG.DEVELOPMENT_MODE && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">DEV MODE</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isSubscribed ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      {subscriptionTier} Plan Active
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={manageSubscription}
                      className="flex items-center space-x-1"
                    >
                      <Settings className="h-3 w-3" />
                      <span>Manage</span>
                    </Button>
                  </div>
                  {subscriptionEnd && (
                    <p className="text-xs text-gray-500">
                      Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Subscribe to unlock all features
                  </p>
                  <Button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <SubscriptionGuard>
            <Button
              onClick={() => setShowCreateNote(true)}
              className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
            >
              <Plus className="mr-3 h-6 w-6" />
              Create New Notes
            </Button>
          </SubscriptionGuard>
          
          <SubscriptionGuard>
            <Button
              onClick={() => navigate("/exam-setup")}
              variant="outline"
              className="w-full h-14 text-lg border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl"
            >
              <Upload className="mr-3 h-5 w-5" />
              Start Oral Exam
            </Button>
          </SubscriptionGuard>

          <SubscriptionGuard>
            <Button
              onClick={() => navigate("/performance-dashboard")}
              variant="outline"
              className="w-full h-14 text-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-50 rounded-xl"
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Performance Dashboard
            </Button>
          </SubscriptionGuard>
        </div>

        {/* Recent Activity */}
        <SubscriptionGuard>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-800 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentExams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exams yet. Create some notes and start practicing!</p>
                </div>
              ) : (
                recentExams.map((exam) => {
                  const rating = getRatingFromScore(exam.percentage_score);
                  return (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate("/results", { state: { exam_id: exam.id } })}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 text-sm leading-tight">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(exam.created_at)}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <div className={`text-sm font-medium ${getRatingColor(rating)}`}>
                          {rating}
                        </div>
                        <div className="text-xs text-gray-500">
                          {exam.percentage_score ? `${exam.percentage_score}%` : 'In Progress'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </SubscriptionGuard>

        {/* Quick Access */}
        <SubscriptionGuard>
          <Button
            onClick={() => navigate("/my-notes")}
            variant="ghost"
            className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-white/50"
          >
            <FileText className="mr-2 h-4 w-4" />
            My Notes
          </Button>
        </SubscriptionGuard>
      </div>

      <CreateNoteModal 
        isOpen={showCreateNote}
        onClose={() => setShowCreateNote(false)}
      />

      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
};

export default Home;
