
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, ArrowRight, Square } from "lucide-react";

const OralExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionCount = 10 } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  // Mock questions
  const sampleQuestions = [
    "Explain the process of photosynthesis and its importance in the ecosystem.",
    "What are the main stages of cellular respiration?",
    "Describe the structure and function of chloroplasts.",
    "How do plants adapt to different environmental conditions?",
    "What is the role of enzymes in metabolic processes?",
    "Explain the difference between mitosis and meiosis.",
    "What are the main components of the cell membrane?",
    "How does DNA replication occur?",
    "Describe the process of protein synthesis.",
    "What is the significance of the Calvin cycle?",
  ];

  const currentQuestionText = sampleQuestions[currentQuestion - 1] || "Sample question for demonstration.";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and save answer
      setAnswers(prev => [...prev, `Answer ${currentQuestion}`]);
    }
    setIsRecording(!isRecording);
  };

  const nextQuestion = () => {
    if (currentQuestion < questionCount) {
      setCurrentQuestion(prev => prev + 1);
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      // Complete exam
      navigate("/results", { 
        state: { 
          totalQuestions: questionCount,
          answers: answers 
        } 
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentQuestion / questionCount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header with Progress */}
        <div className="pt-8 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold text-gray-800">Oral Exam</h1>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion} of {questionCount}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800">
              Question {currentQuestion}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-base leading-relaxed">
              {currentQuestionText}
            </p>
          </CardContent>
        </Card>

        {/* Recording Controls */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-4">
              {/* Recording Status */}
              <div className="h-8">
                {isRecording ? (
                  <div className="flex items-center justify-center text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium">Recording: {formatTime(recordingTime)}</span>
                  </div>
                ) : (
                  <p className="text-gray-600">Tap the microphone to start recording your answer</p>
                )}
              </div>

              {/* Microphone Button */}
              <Button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full shadow-lg transition-all duration-300 ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 scale-110" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isRecording ? (
                  <Square className="h-8 w-8 text-white" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </Button>

              {/* Recording Instructions */}
              <p className="text-sm text-gray-500">
                {isRecording 
                  ? "Tap the square to stop recording" 
                  : "Speak clearly and take your time"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {answers.length > 0 && "Answer recorded ✓"}
          </div>
          
          <Button
            onClick={nextQuestion}
            disabled={isRecording || answers.length < currentQuestion}
            className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg disabled:opacity-50"
          >
            {currentQuestion === questionCount ? "Finish Exam" : "Next Question"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">{currentQuestion}</div>
            <div className="text-xs text-gray-600">Current</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">{answers.length}</div>
            <div className="text-xs text-gray-600">Answered</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
            <div className="text-lg font-bold text-gray-600">{questionCount - currentQuestion}</div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OralExam;
