
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Upload, Mic, FileText, Star, Calendar } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  // Mock recent exams data
  const recentExams = [
    {
      id: 1,
      topic: "Biology Chapter 5 - Photosynthesis",
      date: "2 days ago",
      rating: "Excellent",
      score: "8.5/10",
    },
    {
      id: 2,
      topic: "History - World War II",
      date: "1 week ago", 
      rating: "Good",
      score: "7.2/10",
    },
    {
      id: 3,
      topic: "Chemistry - Organic Compounds",
      date: "2 weeks ago",
      rating: "Needs Improvement",
      score: "5.8/10",
    },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">OralEase</h1>
          <p className="text-gray-600">Your AI Oral Exam Study Buddy</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/upload")}
            className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
          >
            <Mic className="mr-3 h-6 w-6" />
            Start New Oral Exam
          </Button>
          
          <Button
            onClick={() => navigate("/upload")}
            variant="outline"
            className="w-full h-14 text-lg border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl"
          >
            <Upload className="mr-3 h-5 w-5" />
            Upload New Notes
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-800 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/results")}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm leading-tight">
                    {exam.topic}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{exam.date}</p>
                </div>
                <div className="text-right ml-3">
                  <div className={`text-sm font-medium ${getRatingColor(exam.rating)}`}>
                    {exam.rating}
                  </div>
                  <div className="text-xs text-gray-500">{exam.score}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Button
          onClick={() => navigate("/my-notes")}
          variant="ghost"
          className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-white/50"
        >
          <FileText className="mr-2 h-4 w-4" />
          My Notes
        </Button>
      </div>
    </div>
  );
};

export default Home;
