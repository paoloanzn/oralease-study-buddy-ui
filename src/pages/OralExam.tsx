import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, ArrowRight, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ENDPOINTS } from "@/config/endpoints";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "open_ended" | "true_false";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  order_index: number;
  multiple_choice_options?: {
    options: string[];
    correct_answer: string;
  };
}

const getQuestionTypeColor = (type: Question["question_type"]) => {
  switch (type) {
    case "multiple_choice":
      return "bg-blue-100 text-blue-800";
    case "true_false":
      return "bg-purple-100 text-purple-800";
    case "open_ended":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getQuestionTypeLabel = (type: Question["question_type"]) => {
  switch (type) {
    case "multiple_choice":
      return "Multiple Choice";
    case "true_false":
      return "True/False";
    case "open_ended":
      return "Open Ended";
    default:
      return type;
  }
};

const OralExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { exam_id, questions, questionCount } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestionData = questions[currentQuestion - 1] as Question;

  useEffect(() => {
    console.log('Current Question Data:', currentQuestionData);
    if (currentQuestionData?.question_type === 'multiple_choice') {
      console.log('Multiple Choice Options:', currentQuestionData.multiple_choice_options);
    }
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording, currentQuestionData]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Request data every 1 second
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Process the recording
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      console.log('Audio chunks collected:', audioChunksRef.current.length);
      console.log('Audio blob size:', audioBlob.size);
      processRecording(audioBlob);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          console.log('Base64 audio length:', result.length);
          resolve(result);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Send to transcription endpoint
      const response = await fetch(ENDPOINTS.TRANSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_data: base64Audio,
          exam_id,
          question_id: currentQuestionData.id,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const result = await response.json();
      setAnswers(prev => [...prev, result.transcription]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questionCount) {
      setCurrentQuestion(prev => prev + 1);
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      // Complete exam
      try {
        setIsProcessing(true);
        const response = await fetch(ENDPOINTS.EVALUATE_EXAM, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exam_id,
            user_id: (await supabase.auth.getUser()).data.user?.id
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to evaluate exam');
        }

        const result = await response.json();
        navigate("/results", { 
          state: { 
            exam_id,
            results: result
          } 
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to complete exam. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-800">
                Question {currentQuestion}
              </CardTitle>
              <Badge className={getQuestionTypeColor(currentQuestionData?.question_type)}>
                {getQuestionTypeLabel(currentQuestionData?.question_type)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {currentQuestionData?.question_text}
            </p>
            
            {currentQuestionData?.question_type === "multiple_choice" && (
              <div className="mt-4 space-y-2">
                {(
                  Array.isArray(currentQuestionData.multiple_choice_options)
                    ? currentQuestionData.multiple_choice_options
                    : currentQuestionData.multiple_choice_options?.options || []
                ).map((option, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg text-gray-700"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                ))}
              </div>
            )}

            {currentQuestionData?.question_type === "true_false" && (
              <div className="mt-4 space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700">True</div>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700">False</div>
              </div>
            )}
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
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
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
            disabled={isRecording || isProcessing || answers.length < currentQuestion}
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
