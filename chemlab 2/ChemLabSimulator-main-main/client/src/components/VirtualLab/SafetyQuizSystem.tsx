import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Book,
  AlertTriangle,
  FileText,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  image?: string;
  difficulty: "basic" | "intermediate" | "advanced";
  safetyLevel: "critical" | "important" | "recommended";
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface SafetyQuizProps {
  onCertificationEarned?: (certificate: CertificationData) => void;
  requiredScore?: number; // percentage required to pass
}

interface CertificationData {
  id: string;
  studentName: string;
  dateEarned: string;
  score: number;
  validUntil: string;
  quizType: string;
  certificateNumber: string;
}

const safetyQuestions: QuizQuestion[] = [
  {
    id: "q1",
    category: "Personal Protective Equipment",
    question:
      "Which of the following PPE items should ALWAYS be worn in a chemistry laboratory?",
    options: [
      "Safety goggles only",
      "Lab coat only",
      "Safety goggles and closed-toe shoes",
      "Gloves only",
    ],
    correctAnswer: 2,
    explanation:
      "Safety goggles protect your eyes from chemical splashes and vapors, while closed-toe shoes protect your feet from spills and broken glass. Both are essential baseline PPE.",
    difficulty: "basic",
    safetyLevel: "critical",
  },
  {
    id: "q2",
    category: "Chemical Handling",
    question: "When diluting concentrated sulfuric acid, you should:",
    options: [
      "Add water to the acid quickly",
      "Add acid to water slowly while stirring",
      "Mix equal volumes rapidly",
      "Heat the mixture while combining",
    ],
    correctAnswer: 1,
    explanation:
      "Always add acid to water, never water to acid. The reaction is highly exothermic and adding water to acid can cause violent boiling and splashing.",
    difficulty: "intermediate",
    safetyLevel: "critical",
  },
  {
    id: "q3",
    category: "Emergency Procedures",
    question: "If a chemical splashes in your eyes, you should:",
    options: [
      "Rub your eyes immediately",
      "Use the eyewash station for at least 15 minutes",
      "Apply eye drops",
      "Wait to see if irritation develops",
    ],
    correctAnswer: 1,
    explanation:
      "Immediate and continuous irrigation with clean water for at least 15 minutes is crucial to prevent permanent eye damage.",
    difficulty: "basic",
    safetyLevel: "critical",
  },
  {
    id: "q4",
    category: "Equipment Safety",
    question: "Before using a Bunsen burner, you should:",
    options: [
      "Light the match first, then turn on the gas",
      "Turn on the gas first, then light it",
      "Check for gas leaks and ensure proper ventilation",
      "Adjust the flame to maximum height",
    ],
    correctAnswer: 2,
    explanation:
      "Always check for gas leaks using soapy water and ensure adequate ventilation before lighting any gas burner to prevent accidents.",
    difficulty: "basic",
    safetyLevel: "important",
  },
  {
    id: "q5",
    category: "Waste Disposal",
    question: "Organic solvents should be disposed of by:",
    options: [
      "Pouring down the drain with lots of water",
      "Evaporating in the fume hood",
      "Collecting in designated waste containers",
      "Burning in the lab",
    ],
    correctAnswer: 2,
    explanation:
      "Organic solvents must be collected in appropriate waste containers for proper disposal. Never pour chemicals down drains or attempt to burn them.",
    difficulty: "intermediate",
    safetyLevel: "important",
  },
  {
    id: "q6",
    category: "Chemical Storage",
    question: "Acids and bases should be stored:",
    options: [
      "Together in the same cabinet",
      "In separate, dedicated storage areas",
      "In the refrigerator",
      "On high shelves only",
    ],
    correctAnswer: 1,
    explanation:
      "Acids and bases should be stored separately to prevent accidental mixing, which could cause dangerous reactions.",
    difficulty: "basic",
    safetyLevel: "important",
  },
  {
    id: "q7",
    category: "Fire Safety",
    question:
      "If a small fire occurs in a beaker, the best immediate action is to:",
    options: [
      "Pour water on it",
      "Blow on it to extinguish it",
      "Cover with a watch glass or sand",
      "Move the beaker to the sink",
    ],
    correctAnswer: 2,
    explanation:
      "Covering a small fire cuts off the oxygen supply. Never use water on chemical fires as it may spread the fire or cause dangerous reactions.",
    difficulty: "intermediate",
    safetyLevel: "critical",
  },
  {
    id: "q8",
    category: "Gas Safety",
    question: "If you smell gas in the laboratory, you should:",
    options: [
      "Light a match to test for gas",
      "Turn off all gas valves and ventilate the area",
      "Continue working but open a window",
      "Use electrical equipment to locate the leak",
    ],
    correctAnswer: 1,
    explanation:
      "Immediately turn off gas sources, avoid sparks or flames, and ventilate the area. Never use open flames or electrical equipment that could ignite gas.",
    difficulty: "advanced",
    safetyLevel: "critical",
  },
  {
    id: "q9",
    category: "First Aid",
    question: "For a minor chemical burn on skin, the immediate treatment is:",
    options: [
      "Apply ice directly",
      "Apply butter or oil",
      "Rinse with cool water for 20 minutes",
      "Apply antiseptic cream",
    ],
    correctAnswer: 2,
    explanation:
      "Cool water helps remove heat and dilute any remaining chemical. Ice can cause additional tissue damage, and other substances may interfere with healing.",
    difficulty: "basic",
    safetyLevel: "critical",
  },
  {
    id: "q10",
    category: "Equipment Safety",
    question: "When working with glassware, you should:",
    options: [
      "Force connections if they don't fit",
      "Use chipped or cracked glassware if damage is minor",
      "Inspect all glassware before use",
      "Heat glass directly with open flame",
    ],
    correctAnswer: 2,
    explanation:
      "Always inspect glassware for cracks, chips, or stress marks before use. Damaged glassware can fail unexpectedly and cause injury.",
    difficulty: "basic",
    safetyLevel: "important",
  },
];

export const SafetyQuizSystem: React.FC<SafetyQuizProps> = ({
  onCertificationEarned,
  requiredScore = 80,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [certification, setCertification] = useState<CertificationData | null>(
    null,
  );

  useEffect(() => {
    if (quizStarted && !isQuizComplete) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, isQuizComplete]);

  const currentQuestion = safetyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / safetyQuestions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const questionTime = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent: questionTime / 1000,
    };

    setResults((prev) => [...prev, result]);

    if (currentQuestionIndex < safetyQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      completeQuiz([...results, result]);
    }
  };

  const completeQuiz = (allResults: QuizResult[]) => {
    const correctAnswers = allResults.filter((r) => r.isCorrect).length;
    const score = Math.round((correctAnswers / safetyQuestions.length) * 100);

    setFinalScore(score);
    setIsQuizComplete(true);

    if (score >= requiredScore && studentName.trim()) {
      const cert: CertificationData = {
        id: `cert_${Date.now()}`,
        studentName: studentName.trim(),
        dateEarned: new Date().toISOString().split("T")[0],
        score,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 1 year validity
        quizType: "Laboratory Safety Certification",
        certificateNumber: `LS-${Date.now().toString().slice(-6)}`,
      };

      setCertification(cert);
      if (onCertificationEarned) {
        onCertificationEarned(cert);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setResults([]);
    setIsQuizComplete(false);
    setTimeSpent(0);
    setQuestionStartTime(Date.now());
    setShowExplanation(false);
    setQuizStarted(false);
    setFinalScore(0);
    setCertification(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "important":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "recommended":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basic":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Laboratory Safety Certification Quiz
          </CardTitle>
          <p className="text-gray-600">
            Complete this safety quiz to earn your laboratory certification. You
            need {requiredScore}% or higher to pass.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Quiz Information
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • {safetyQuestions.length} questions covering essential lab
                safety
              </li>
              <li>• Passing score: {requiredScore}%</li>
              <li>• Certificate valid for 1 year</li>
              <li>• No time limit, but aim for accuracy over speed</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name (for certificate)
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <Button
            onClick={() => {
              setQuizStarted(true);
              setQuestionStartTime(Date.now());
            }}
            disabled={!studentName.trim()}
            className="w-full"
            size="lg"
          >
            <Book className="w-4 h-4 mr-2" />
            Start Safety Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isQuizComplete) {
    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const passed = finalScore >= requiredScore;

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center mb-4">
            {passed ? (
              <CheckCircle className="w-8 h-8 mr-3 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 mr-3 text-red-600" />
            )}
            Quiz Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">
                  {finalScore}%
                </div>
                <div className="text-sm text-gray-600">Final Score</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">
                  {correctAnswers}/{safetyQuestions.length}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </CardContent>
            </Card>
          </div>

          {/* Pass/Fail Message */}
          <div
            className={`p-4 rounded-lg border ${
              passed
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {passed ? (
                <Award className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              <div>
                <div className="font-semibold">
                  {passed
                    ? "Congratulations! You passed the safety quiz."
                    : "Quiz not passed. Please review and try again."}
                </div>
                <div className="text-sm">
                  {passed
                    ? `You scored ${finalScore}% and have earned your laboratory safety certification.`
                    : `You need ${requiredScore}% to pass. Your score was ${finalScore}%.`}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate */}
          {certification && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-8 h-8 text-gold-500" />
                </div>
                <h2 className="text-xl font-bold text-blue-800">
                  Certificate of Completion
                </h2>
                <p className="text-blue-600">Laboratory Safety Training</p>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-lg">This certifies that</p>
                <p className="text-2xl font-bold text-blue-800">
                  {certification.studentName}
                </p>
                <p>has successfully completed the Laboratory Safety Quiz</p>
                <p>
                  with a score of{" "}
                  <span className="font-bold">{certification.score}%</span>
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="font-medium">Date Earned:</p>
                    <p>
                      {new Date(certification.dateEarned).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Valid Until:</p>
                    <p>
                      {new Date(certification.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  Certificate Number: {certification.certificateNumber}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safetyQuestions.map((question, index) => {
                  const result = results[index];
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              variant="outline"
                              className={getSafetyLevelColor(
                                question.safetyLevel,
                              )}
                            >
                              {question.safetyLevel}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(
                                question.difficulty,
                              )}
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{question.question}</h4>
                        </div>
                        <div className="ml-4">
                          {result.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Your answer:</strong>{" "}
                          {question.options[result.selectedAnswer]}
                        </p>
                        {!result.isCorrect && (
                          <p>
                            <strong>Correct answer:</strong>{" "}
                            {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-blue-600">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button onClick={restartQuiz} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            {certification && (
              <Button onClick={() => window.print()}>
                <FileText className="w-4 h-4 mr-2" />
                Print Certificate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Safety Quiz - Question {currentQuestionIndex + 1} of{" "}
            {safetyQuestions.length}
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeSpent)}
            </div>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Info */}
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className={getSafetyLevelColor(currentQuestion.safetyLevel)}
          >
            {currentQuestion.safetyLevel}
          </Badge>
          <Badge
            variant="outline"
            className={getDifficultyColor(currentQuestion.difficulty)}
          >
            {currentQuestion.difficulty}
          </Badge>
          <Badge variant="outline">{currentQuestion.category}</Badge>
        </div>

        {/* Question */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === index
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedAnswer === index
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAnswer === index && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">
                  Explanation
                </h4>
                <p className="text-green-700">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowExplanation(!showExplanation)}
            disabled={selectedAnswer === null}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showExplanation ? "Hide" : "Show"} Explanation
          </Button>

          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            {currentQuestionIndex === safetyQuestions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyQuizSystem;
