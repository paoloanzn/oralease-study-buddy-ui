import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ENDPOINTS } from "@/config/endpoints";
import { useQuery } from "@tanstack/react-query";

const ExamSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedNotes, setSelectedNotes] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available notes
  const { data: availableNotes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const questionOptions = [
    { value: "5", label: "5 Questions (Quick)" },
    { value: "10", label: "10 Questions (Standard)" },
    { value: "15", label: "15 Questions (Comprehensive)" },
    { value: "20", label: "20 Questions (Full Test)" },
  ];

  const handleStartExam = async () => {
    if (!selectedNotes || !questionCount) return;

    setIsLoading(true);
    try {
      const response = await fetch(ENDPOINTS.CREATE_EXAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes_id: selectedNotes,
          question_count: parseInt(questionCount),
          user_id: (await supabase.auth.getUser()).data.user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create exam');
      }

      const result = await response.json();
      
      navigate("/oral-exam", { 
        state: { 
          exam_id: result.exam_id,
          questions: result.questions,
          questionCount: parseInt(questionCount)
        } 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center pt-8 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-2 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Exam Setup</h1>
        </div>

        {/* Setup Form */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800">Configure Your Oral Exam</CardTitle>
            <p className="text-sm text-gray-600">Choose your study material and exam preferences</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notes Selection */}
            <div className="space-y-2">
              <Label htmlFor="notes-select">Select Notes</Label>
              <Select value={selectedNotes} onValueChange={setSelectedNotes}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your study notes" />
                </SelectTrigger>
                <SelectContent>
                  {availableNotes.map((note) => (
                    <SelectItem key={note.id} value={note.id}>
                      {note.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="questions-select">Number of Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="How many questions?" />
                </SelectTrigger>
                <SelectContent>
                  {questionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam Preview */}
            {selectedNotes && questionCount && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Exam Preview</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><span className="font-medium">Notes:</span> {availableNotes.find(n => n.id === selectedNotes)?.title}</p>
                  <p><span className="font-medium">Questions:</span> {questionCount}</p>
                  <p><span className="font-medium">Estimated Time:</span> {Math.ceil(parseInt(questionCount) * 1.5)} minutes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="shadow-lg border-0 bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <h3 className="font-medium text-green-800 mb-2">💡 Exam Tips</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Take a moment to think before answering</li>
              <li>• Don't worry about perfect answers</li>
              <li>• Use this as practice, not a test!</li>
            </ul>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          onClick={handleStartExam}
          disabled={!selectedNotes || !questionCount || isLoading}
          className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="mr-3 h-5 w-5" />
          {isLoading ? "Creating Exam..." : "Start Oral Exam"}
        </Button>
      </div>
    </div>
  );
};

export default ExamSetup;
