import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Printer,
  Save,
  Eye,
  BarChart3,
  Camera,
  BookOpen,
  User,
  Calendar,
  Clock,
} from "lucide-react";

interface ExperimentData {
  experimentTitle: string;
  experimentDate: string;
  duration: number; // in minutes
  studentName?: string;
  studentId?: string;
  instructor?: string;
  course?: string;
  objectives: string[];
  procedure: string[];
  observations: string[];
  results: Array<{
    measurement: string;
    value: number | string;
    unit: string;
    notes?: string;
  }>;
  calculations: Array<{
    description: string;
    formula: string;
    calculation: string;
    result: string;
  }>;
  images?: string[]; // base64 encoded images
  conclusion: string;
  safetyNotes: string[];
  recommendations: string[];
}

interface ExperimentReportGeneratorProps {
  experimentData?: Partial<ExperimentData>;
  onSave?: (reportData: ExperimentData) => void;
  onExport?: (format: "pdf" | "docx" | "txt") => void;
}

export const ExperimentReportGenerator: React.FC<
  ExperimentReportGeneratorProps
> = ({ experimentData = {}, onSave, onExport }) => {
  const [reportData, setReportData] = useState<ExperimentData>({
    experimentTitle: experimentData.experimentTitle || "",
    experimentDate:
      experimentData.experimentDate || new Date().toISOString().split("T")[0],
    duration: experimentData.duration || 0,
    studentName: experimentData.studentName || "",
    studentId: experimentData.studentId || "",
    instructor: experimentData.instructor || "",
    course: experimentData.course || "Chemistry Laboratory",
    objectives: experimentData.objectives || [""],
    procedure: experimentData.procedure || [""],
    observations: experimentData.observations || [""],
    results: experimentData.results || [],
    calculations: experimentData.calculations || [],
    images: experimentData.images || [],
    conclusion: experimentData.conclusion || "",
    safetyNotes: experimentData.safetyNotes || [""],
    recommendations: experimentData.recommendations || [""],
  });

  const [currentSection, setCurrentSection] = useState<string>("header");
  const [previewMode, setPreviewMode] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const updateReportData = (field: keyof ExperimentData, value: any) => {
    setReportData((prev) => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof ExperimentData, defaultValue: any) => {
    const currentArray = reportData[field] as any[];
    updateReportData(field, [...currentArray, defaultValue]);
  };

  const updateArrayItem = (
    field: keyof ExperimentData,
    index: number,
    value: any,
  ) => {
    const currentArray = reportData[field] as any[];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateReportData(field, newArray);
  };

  const removeArrayItem = (field: keyof ExperimentData, index: number) => {
    const currentArray = reportData[field] as any[];
    updateReportData(
      field,
      currentArray.filter((_, i) => i !== index),
    );
  };

  const generatePDFReport = () => {
    // Create a printable HTML version
    const printContent = reportRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laboratory Report - ${reportData.experimentTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
            .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .data-table th { background-color: #f5f5f5; }
            .calculation { background-color: #f9f9f9; padding: 10px; margin: 5px 0; border-left: 4px solid #007bff; }
            .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportData.experimentTitle.toLowerCase().replace(/\s+/g, "_")}_report.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!reportData.results || reportData.results.length === 0) return;

    const csvContent = [
      ["Measurement", "Value", "Unit", "Notes"].join(","),
      ...(reportData.results || []).map((result) =>
        [
          result.measurement,
          result.value,
          result.unit,
          result.notes || "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportData.experimentTitle.toLowerCase().replace(/\s+/g, "_")}_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    {
      id: "header",
      title: "Header Information",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "objectives",
      title: "Objectives",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "procedure",
      title: "Procedure",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "observations",
      title: "Observations",
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: "results",
      title: "Results & Data",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "calculations",
      title: "Calculations",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "conclusion",
      title: "Conclusion",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "safety",
      title: "Safety & Recommendations",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  const renderSectionContent = () => {
    switch (currentSection) {
      case "header":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Experiment Title
                </label>
                <Input
                  value={reportData.experimentTitle}
                  onChange={(e) =>
                    updateReportData("experimentTitle", e.target.value)
                  }
                  placeholder="Enter experiment title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={reportData.experimentDate}
                  onChange={(e) =>
                    updateReportData("experimentDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Student Name
                </label>
                <Input
                  value={reportData.studentName}
                  onChange={(e) =>
                    updateReportData("studentName", e.target.value)
                  }
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Student ID
                </label>
                <Input
                  value={reportData.studentId}
                  onChange={(e) =>
                    updateReportData("studentId", e.target.value)
                  }
                  placeholder="Student ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Instructor
                </label>
                <Input
                  value={reportData.instructor}
                  onChange={(e) =>
                    updateReportData("instructor", e.target.value)
                  }
                  placeholder="Instructor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course</label>
                <Input
                  value={reportData.course}
                  onChange={(e) => updateReportData("course", e.target.value)}
                  placeholder="Course name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={reportData.duration}
                onChange={(e) =>
                  updateReportData("duration", Number(e.target.value))
                }
                placeholder="Experiment duration"
              />
            </div>
          </div>
        );

      case "objectives":
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Learning Objectives</h3>
            {(reportData.objectives || []).map((objective, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Textarea
                  value={objective}
                  onChange={(e) =>
                    updateArrayItem("objectives", index, e.target.value)
                  }
                  placeholder={`Objective ${index + 1}`}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeArrayItem("objectives", index)}
                  disabled={reportData.objectives.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              onClick={() => addArrayItem("objectives", "")}
              className="w-full"
            >
              Add Objective
            </Button>
          </div>
        );

      case "procedure":
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Experimental Procedure</h3>
            {reportData.procedure.map((step, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Badge variant="outline" className="mt-2">
                  {index + 1}
                </Badge>
                <Textarea
                  value={step}
                  onChange={(e) =>
                    updateArrayItem("procedure", index, e.target.value)
                  }
                  placeholder={`Step ${index + 1}`}
                  className="flex-1"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeArrayItem("procedure", index)}
                  disabled={reportData.procedure.length === 1}
                  className="mt-2"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              onClick={() => addArrayItem("procedure", "")}
              className="w-full"
            >
              Add Step
            </Button>
          </div>
        );

      case "observations":
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Experimental Observations</h3>
            {reportData.observations.map((observation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Textarea
                  value={observation}
                  onChange={(e) =>
                    updateArrayItem("observations", index, e.target.value)
                  }
                  placeholder={`Observation ${index + 1}`}
                  className="flex-1"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeArrayItem("observations", index)}
                  disabled={reportData.observations.length === 1}
                  className="mt-2"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              onClick={() => addArrayItem("observations", "")}
              className="w-full"
            >
              Add Observation
            </Button>
          </div>
        );

      case "results":
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Results and Data</h3>
            {reportData.results.map((result, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 p-3 border rounded"
              >
                <Input
                  value={result.measurement}
                  onChange={(e) =>
                    updateArrayItem("results", index, {
                      ...result,
                      measurement: e.target.value,
                    })
                  }
                  placeholder="Measurement"
                />
                <Input
                  value={result.value}
                  onChange={(e) =>
                    updateArrayItem("results", index, {
                      ...result,
                      value: e.target.value,
                    })
                  }
                  placeholder="Value"
                />
                <Input
                  value={result.unit}
                  onChange={(e) =>
                    updateArrayItem("results", index, {
                      ...result,
                      unit: e.target.value,
                    })
                  }
                  placeholder="Unit"
                />
                <div className="flex items-center space-x-1">
                  <Input
                    value={result.notes || ""}
                    onChange={(e) =>
                      updateArrayItem("results", index, {
                        ...result,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Notes"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem("results", index)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
            <Button
              size="sm"
              onClick={() =>
                addArrayItem("results", {
                  measurement: "",
                  value: "",
                  unit: "",
                  notes: "",
                })
              }
              className="w-full"
            >
              Add Result
            </Button>
          </div>
        );

      case "calculations":
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Calculations</h3>
            {reportData.calculations.map((calc, index) => (
              <div key={index} className="p-4 border rounded space-y-2">
                <Input
                  value={calc.description}
                  onChange={(e) =>
                    updateArrayItem("calculations", index, {
                      ...calc,
                      description: e.target.value,
                    })
                  }
                  placeholder="Calculation description"
                />
                <Input
                  value={calc.formula}
                  onChange={(e) =>
                    updateArrayItem("calculations", index, {
                      ...calc,
                      formula: e.target.value,
                    })
                  }
                  placeholder="Formula (e.g., C = n/V)"
                />
                <Textarea
                  value={calc.calculation}
                  onChange={(e) =>
                    updateArrayItem("calculations", index, {
                      ...calc,
                      calculation: e.target.value,
                    })
                  }
                  placeholder="Show your work"
                  rows={2}
                />
                <div className="flex items-center space-x-2">
                  <Input
                    value={calc.result}
                    onChange={(e) =>
                      updateArrayItem("calculations", index, {
                        ...calc,
                        result: e.target.value,
                      })
                    }
                    placeholder="Final result"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem("calculations", index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button
              size="sm"
              onClick={() =>
                addArrayItem("calculations", {
                  description: "",
                  formula: "",
                  calculation: "",
                  result: "",
                })
              }
              className="w-full"
            >
              Add Calculation
            </Button>
          </div>
        );

      case "conclusion":
        return (
          <div>
            <h3 className="font-medium mb-4">Conclusion and Discussion</h3>
            <Textarea
              value={reportData.conclusion}
              onChange={(e) => updateReportData("conclusion", e.target.value)}
              placeholder="Summarize your findings, discuss sources of error, and relate results to theory..."
              rows={8}
              className="w-full"
            />
          </div>
        );

      case "safety":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Safety Notes</h3>
              {reportData.safetyNotes.map((note, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Textarea
                    value={note}
                    onChange={(e) =>
                      updateArrayItem("safetyNotes", index, e.target.value)
                    }
                    placeholder={`Safety note ${index + 1}`}
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem("safetyNotes", index)}
                    disabled={reportData.safetyNotes.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                onClick={() => addArrayItem("safetyNotes", "")}
                className="w-full"
              >
                Add Safety Note
              </Button>
            </div>

            <div>
              <h3 className="font-medium mb-4">Recommendations</h3>
              {reportData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Textarea
                    value={rec}
                    onChange={(e) =>
                      updateArrayItem("recommendations", index, e.target.value)
                    }
                    placeholder={`Recommendation ${index + 1}`}
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem("recommendations", index)}
                    disabled={reportData.recommendations.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                onClick={() => addArrayItem("recommendations", "")}
                className="w-full"
              >
                Add Recommendation
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => (
    <div ref={reportRef} className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="header text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Laboratory Report</h1>
        <h2 className="text-xl text-blue-600 mb-4">
          {reportData.experimentTitle}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-left">
            <p>
              <strong>Student:</strong> {reportData.studentName}
            </p>
            <p>
              <strong>Student ID:</strong> {reportData.studentId}
            </p>
            <p>
              <strong>Course:</strong> {reportData.course}
            </p>
          </div>
          <div className="text-right">
            <p>
              <strong>Instructor:</strong> {reportData.instructor}
            </p>
            <p>
              <strong>Date:</strong> {reportData.experimentDate}
            </p>
            <p>
              <strong>Duration:</strong> {reportData.duration} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="section">
        <h3 className="section-title">Objectives</h3>
        <ul className="list-disc list-inside">
          {reportData.objectives
            .filter((obj) => obj.trim())
            .map((objective, index) => (
              <li key={index} className="mb-1">
                {objective}
              </li>
            ))}
        </ul>
      </div>

      {/* Procedure */}
      <div className="section">
        <h3 className="section-title">Procedure</h3>
        <ol className="list-decimal list-inside">
          {reportData.procedure
            .filter((step) => step.trim())
            .map((step, index) => (
              <li key={index} className="mb-2">
                {step}
              </li>
            ))}
        </ol>
      </div>

      {/* Observations */}
      <div className="section">
        <h3 className="section-title">Observations</h3>
        {reportData.observations
          .filter((obs) => obs.trim())
          .map((observation, index) => (
            <p key={index} className="mb-2">
              {observation}
            </p>
          ))}
      </div>

      {/* Results */}
      {reportData.results.length > 0 && (
        <div className="section">
          <h3 className="section-title">Results and Data</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Measurement</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {reportData.results.map((result, index) => (
                <tr key={index}>
                  <td>{result.measurement}</td>
                  <td>{result.value}</td>
                  <td>{result.unit}</td>
                  <td>{result.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calculations */}
      {reportData.calculations.length > 0 && (
        <div className="section">
          <h3 className="section-title">Calculations</h3>
          {reportData.calculations
            .filter((calc) => calc.description.trim())
            .map((calc, index) => (
              <div key={index} className="calculation">
                <h4 className="font-medium">{calc.description}</h4>
                {calc.formula && (
                  <p>
                    <strong>Formula:</strong> {calc.formula}
                  </p>
                )}
                {calc.calculation && (
                  <p>
                    <strong>Calculation:</strong> {calc.calculation}
                  </p>
                )}
                {calc.result && (
                  <p>
                    <strong>Result:</strong> {calc.result}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Conclusion */}
      {reportData.conclusion && reportData.conclusion.trim() && (
        <div className="section">
          <h3 className="section-title">Conclusion</h3>
          <p>{reportData.conclusion}</p>
        </div>
      )}

      {/* Safety Notes */}
      {reportData.safetyNotes.some((note) => note.trim()) && (
        <div className="section">
          <h3 className="section-title">Safety Notes</h3>
          <ul className="list-disc list-inside">
            {reportData.safetyNotes
              .filter((note) => note.trim())
              .map((note, index) => (
                <li key={index} className="mb-1">
                  {note}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {reportData.recommendations.some((rec) => rec.trim()) && (
        <div className="section">
          <h3 className="section-title">Recommendations for Future Work</h3>
          <ul className="list-disc list-inside">
            {reportData.recommendations
              .filter((rec) => rec.trim())
              .map((rec, index) => (
                <li key={index} className="mb-1">
                  {rec}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="footer text-center text-sm text-gray-600">
        <p>Report generated on {new Date().toLocaleDateString()}</p>
        <p>ChemLab Virtual - Interactive Chemistry Learning Platform</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Control Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Laboratory Report Generator
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={previewMode ? "default" : "outline"}
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
              <Button size="sm" onClick={generatePDFReport}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button size="sm" onClick={exportToJSON}>
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
              <Button
                size="sm"
                onClick={exportToCSV}
                disabled={reportData.results.length === 0}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {previewMode ? (
        renderPreview()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Report Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    size="sm"
                    variant={
                      currentSection === section.id ? "default" : "outline"
                    }
                    onClick={() => setCurrentSection(section.id)}
                    className="w-full justify-start text-sm"
                  >
                    {section.icon}
                    <span className="ml-2">{section.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                {sections.find((s) => s.id === currentSection)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderSectionContent()}</CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExperimentReportGenerator;
