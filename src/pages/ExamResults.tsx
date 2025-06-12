
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Star, RotateCcw, BookOpen, Home, Volume2 } from "lucide-react";

const ExamResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalQuestions = 10 } = location.state || {};

  // Mock results data
  const results = {
    overallScore: 7.8,
    rating: "Good Job!",
    strengths: [
      "Clear articulation and pronunciation",
      "Good understanding of basic concepts",
      "Confident delivery style",
    ],
    improvements: [
      "Include more specific examples",
      "Expand on complex topics",
      "Practice technical terminology",
    ],
    questionBreakdown: [
      {
        question: "Explain the process of photosynthesis and its importance in the ecosystem.",
        answer: "Photosynthesis is the process where plants convert sunlight into energy...",
        feedback: "Correct! Good explanation of the basic process. Consider adding more detail about the light and dark reactions.",
        score: 8.5,
      },
      {
        question: "What are the main stages of cellular respiration?",
        answer: "Cellular respiration has three main stages: glycolysis, citric acid cycle...",
        feedback: "Excellent understanding! You covered all major stages clearly.",
        score: 9.0,
      },
      {
        question: "Describe the structure and function of chloroplasts.",
        answer: "Chloroplasts are organelles found in plant cells...",
        feedback: "Good start, but could elaborate more on the thylakoids and stroma.",
        score: 6.5,
      },
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    return "text-orange-600";
  };

  const getOverallRatingColor = (rating: string) => {
    if (rating.includes("Excellent")) return "text-green-600";
    if (rating.includes("Good")) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>
          <p className="text-gray-600">Here's how you performed</p>
        </div>

        {/* Overall Score */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(results.overallScore / 2)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {results.overallScore}/10
              </div>
              <div className={`text-lg font-medium ${getOverallRatingColor(results.rating)}`}>
                {results.rating}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-lg border-0 bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800">✅ Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800">📈 Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Question Breakdown */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-800">Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.questionBreakdown.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-800 text-sm leading-tight flex-1">
                    Q{index + 1}: {item.question}
                  </h4>
                  <div className={`text-sm font-bold ml-2 ${getScoreColor(item.score)}`}>
                    {item.score}/10
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-gray-600 font-medium">Your Answer:</p>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    {item.answer}
                  </p>
                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-600 font-medium mb-1">AI Feedback:</p>
                    <p className="text-sm text-gray-700">{item.feedback}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/exam-setup")}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Exam
          </Button>
          
          <Button
            onClick={() => navigate("/my-notes")}
            variant="outline"
            className="w-full h-12 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Review Notes
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full h-10 text-gray-600 hover:text-gray-800"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
