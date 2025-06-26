
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, Clock, Award, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
  time: {
    label: "Time (min)",
    color: "hsl(var(--chart-2))",
  },
};

export const PerformanceDashboard = () => {
  // Fetch user's exam performance data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance-data'],
    queryFn: async () => {
      const { data: exams, error } = await supabase
        .from('exams')
        .select(`
          *,
          notes(title, subject),
          exam_feedback(*)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return exams || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const exams = performanceData || [];
  
  // Calculate statistics
  const totalExams = exams.length;
  const averageScore = exams.length > 0 
    ? exams.reduce((sum, exam) => sum + (exam.percentage_score || 0), 0) / exams.length 
    : 0;
  const bestScore = exams.length > 0 
    ? Math.max(...exams.map(exam => exam.percentage_score || 0)) 
    : 0;
  const totalStudyTime = exams.reduce((sum, exam) => sum + (exam.duration_minutes || 0), 0);

  // Prepare chart data
  const scoreTrendData = exams.slice(0, 7).reverse().map((exam, index) => ({
    exam: `Exam ${index + 1}`,
    score: exam.percentage_score || 0,
    time: exam.duration_minutes || 0,
  }));

  const subjectPerformance = exams.reduce((acc, exam) => {
    const subject = exam.notes?.subject || 'General';
    if (!acc[subject]) {
      acc[subject] = { subject, totalScore: 0, count: 0 };
    }
    acc[subject].totalScore += exam.percentage_score || 0;
    acc[subject].count += 1;
    return acc;
  }, {} as Record<string, { subject: string; totalScore: number; count: number }>);

  const subjectData = Object.values(subjectPerformance).map(item => ({
    subject: item.subject,
    averageScore: item.totalScore / item.count,
    count: item.count,
  }));

  const performanceDistribution = [
    { range: '90-100%', count: exams.filter(e => (e.percentage_score || 0) >= 90).length, color: '#22c55e' },
    { range: '80-89%', count: exams.filter(e => (e.percentage_score || 0) >= 80 && (e.percentage_score || 0) < 90).length, color: '#3b82f6' },
    { range: '70-79%', count: exams.filter(e => (e.percentage_score || 0) >= 70 && (e.percentage_score || 0) < 80).length, color: '#f59e0b' },
    { range: 'Below 70%', count: exams.filter(e => (e.percentage_score || 0) < 70).length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">
              Completed assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {averageScore >= 80 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  Excellent performance
                </>
              ) : averageScore >= 70 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
                  Good performance
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-orange-500" />
                  Room for improvement
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Personal best
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</div>
            <p className="text-xs text-muted-foreground">
              Total practice time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-score)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-score)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="averageScore" fill="var(--color-score)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-3">
              {performanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium">{item.range}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count} exams</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exams */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exams.slice(0, 5).map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{exam.notes?.title || exam.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exam.notes?.subject} • {new Date(exam.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    (exam.percentage_score || 0) >= 80 ? 'text-green-600' : 
                    (exam.percentage_score || 0) >= 70 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {exam.percentage_score?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exam.duration_minutes || 0} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
