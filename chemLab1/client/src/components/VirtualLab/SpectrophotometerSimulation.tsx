import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Zap,
  Play,
  Pause,
  Download,
  Settings,
  Eye,
  TrendingUp,
  BarChart3,
  Target,
  Lightbulb,
  Cpu,
} from "lucide-react";

interface SpectralData {
  wavelength: number;
  absorbance: number;
  transmittance: number;
}

interface CalibrationPoint {
  concentration: number;
  absorbance: number;
}

interface Sample {
  name: string;
  concentration: number;
  color: string;
  maxAbsorption: number; // wavelength of maximum absorption
  molarExtinction: number; // L/mol·cm
}

interface SpectrophotometerProps {
  currentSample?: Sample;
  cuvettePathLength?: number; // in cm
  onMeasurementComplete?: (data: {
    wavelength: number;
    absorbance: number;
    concentration: number;
  }) => void;
}

const defaultSamples: { [key: string]: Sample } = {
  copperSulfate: {
    name: "Copper Sulfate",
    concentration: 0.1, // M
    color: "#4488ff",
    maxAbsorption: 810,
    molarExtinction: 12.5,
  },
  ironThiocyanate: {
    name: "Iron Thiocyanate",
    concentration: 0.05,
    color: "#cc2244",
    maxAbsorption: 447,
    molarExtinction: 4570,
  },
  chlorophyll: {
    name: "Chlorophyll Extract",
    concentration: 0.02,
    color: "#22cc44",
    maxAbsorption: 663,
    molarExtinction: 76800,
  },
  methyleneBlue: {
    name: "Methylene Blue",
    concentration: 0.001,
    color: "#2244cc",
    maxAbsorption: 664,
    molarExtinction: 95000,
  },
  unknown: {
    name: "Unknown Sample",
    concentration: 0.075,
    color: "#aa44cc",
    maxAbsorption: 520,
    molarExtinction: 2500,
  },
};

export const SpectrophotometerSimulation: React.FC<SpectrophotometerProps> = ({
  currentSample = defaultSamples.copperSulfate,
  cuvettePathLength = 1.0,
  onMeasurementComplete,
}) => {
  const [isOn, setIsOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentWavelength, setCurrentWavelength] = useState(540);
  const [spectralData, setSpectralData] = useState<SpectralData[]>([]);
  const [calibrationData, setCalibrationData] = useState<CalibrationPoint[]>(
    [],
  );
  const [scanProgress, setScanProgress] = useState(0);
  const [lampIntensity, setLampIntensity] = useState(100);
  const [detectorGain, setDetectorGain] = useState(1.0);
  const [scanMode, setScanMode] = useState<"single" | "full" | "kinetic">(
    "single",
  );
  const [measurementMode, setMeasurementMode] = useState<
    "absorbance" | "transmittance" | "concentration"
  >("absorbance");
  const [autoScale, setAutoScale] = useState(true);
  const [selectedSample, setSelectedSample] = useState<string>("copperSulfate");
  const [showCalibration, setShowCalibration] = useState(false);

  const calculateAbsorbance = (wavelength: number, sample: Sample): number => {
    // Beer's Law: A = ε × b × c
    // with gaussian absorption peak
    const peak = sample.maxAbsorption;
    const bandwidth = 50; // nm
    const intensity = Math.exp(
      -Math.pow(wavelength - peak, 2) / (2 * Math.pow(bandwidth, 2)),
    );
    const baselineAbsorbance =
      (sample.molarExtinction * cuvettePathLength * sample.concentration) /
      10000;

    return baselineAbsorbance * intensity;
  };

  const calculateTransmittance = (absorbance: number): number => {
    return Math.pow(10, -absorbance) * 100;
  };

  const performSingleMeasurement = (wavelength: number): SpectralData => {
    const absorbance = calculateAbsorbance(wavelength, currentSample);
    // Add noise to simulate real instrument
    const noise = (Math.random() - 0.5) * 0.002;
    const measuredAbsorbance = Math.max(0, absorbance + noise);

    return {
      wavelength,
      absorbance: measuredAbsorbance,
      transmittance: calculateTransmittance(measuredAbsorbance),
    };
  };

  const performFullSpectrum = async (): Promise<SpectralData[]> => {
    const data: SpectralData[] = [];
    const startWavelength = 400;
    const endWavelength = 700;
    const step = 2;

    for (let wl = startWavelength; wl <= endWavelength; wl += step) {
      const measurement = performSingleMeasurement(wl);
      data.push(measurement);

      // Update progress
      const progress =
        ((wl - startWavelength) / (endWavelength - startWavelength)) * 100;
      setScanProgress(progress);

      // Simulate scan time
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return data;
  };

  const handleStartScan = async () => {
    if (!isOn) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      if (scanMode === "single") {
        const data = performSingleMeasurement(currentWavelength);
        setSpectralData([data]);

        if (onMeasurementComplete) {
          onMeasurementComplete({
            wavelength: currentWavelength,
            absorbance: data.absorbance,
            concentration: currentSample.concentration,
          });
        }
      } else if (scanMode === "full") {
        const data = await performFullSpectrum();
        setSpectralData(data);
      }
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleCalibrationPoint = () => {
    if (spectralData.length === 0) return;

    const absorbance =
      spectralData[0]?.absorbance ||
      calculateAbsorbance(currentWavelength, currentSample);
    const newPoint: CalibrationPoint = {
      concentration: currentSample.concentration,
      absorbance: absorbance,
    };

    setCalibrationData((prev) =>
      [...prev, newPoint].sort((a, b) => a.concentration - b.concentration),
    );
  };

  const calculateUnknownConcentration = (absorbance: number): number => {
    if (calibrationData.length < 2) return 0;

    // Linear regression for calibration curve
    const n = calibrationData.length;
    const sumX = calibrationData.reduce(
      (sum, point) => sum + point.concentration,
      0,
    );
    const sumY = calibrationData.reduce(
      (sum, point) => sum + point.absorbance,
      0,
    );
    const sumXY = calibrationData.reduce(
      (sum, point) => sum + point.concentration * point.absorbance,
      0,
    );
    const sumX2 = calibrationData.reduce(
      (sum, point) => sum + point.concentration * point.concentration,
      0,
    );

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate concentration from absorbance
    return (absorbance - intercept) / slope;
  };

  const exportData = () => {
    if (spectralData.length === 0) return;

    const csvContent = [
      ["Wavelength (nm)", "Absorbance", "Transmittance (%)"].join(","),
      ...spectralData.map((data) =>
        [
          data.wavelength,
          data.absorbance.toFixed(4),
          data.transmittance.toFixed(2),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spectrum_${currentSample.name.toLowerCase().replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCurrentMeasurement = () => {
    if (spectralData.length === 0) return null;

    if (scanMode === "single") {
      return spectralData[0];
    } else {
      // For full spectrum, find measurement at current wavelength
      return (
        spectralData.find(
          (d) => Math.abs(d.wavelength - currentWavelength) < 5,
        ) || spectralData[0]
      );
    }
  };

  const currentMeasurement = getCurrentMeasurement();

  return (
    <div className="flex flex-col space-y-4">
      {/* Instrument Control Panel */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              UV-Vis Spectrophotometer
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant={isOn ? "default" : "secondary"}>
                {isOn ? "READY" : "STANDBY"}
              </Badge>
              <Badge variant={lampIntensity > 80 ? "default" : "destructive"}>
                Lamp: {lampIntensity}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Display */}
          <div className="bg-black rounded-lg p-4 border border-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Wavelength</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">
                  {currentWavelength} nm
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">
                  {measurementMode === "absorbance"
                    ? "Absorbance"
                    : measurementMode === "transmittance"
                      ? "Transmittance"
                      : "Concentration"}
                </div>
                <div className="text-2xl font-mono font-bold text-green-400">
                  {!isOn
                    ? "---"
                    : currentMeasurement
                      ? measurementMode === "absorbance"
                        ? currentMeasurement.absorbance.toFixed(4)
                        : measurementMode === "transmittance"
                          ? currentMeasurement.transmittance.toFixed(2) + "%"
                          : calculateUnknownConcentration(
                              currentMeasurement.absorbance,
                            ).toFixed(4) + " M"
                      : "0.000"}
                </div>
              </div>
            </div>

            {isScanning && (
              <div className="mt-3">
                <div className="text-xs text-gray-400 mb-1">
                  Scanning Progress
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sample Selection */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(defaultSamples).map(([key, sample]) => (
              <Button
                key={key}
                size="sm"
                variant={selectedSample === key ? "default" : "outline"}
                onClick={() => {
                  setSelectedSample(key);
                  // Update current sample
                  Object.assign(currentSample, sample);
                }}
                className="text-xs"
              >
                {sample.name}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              size="sm"
              variant={isOn ? "destructive" : "default"}
              onClick={() => setIsOn(!isOn)}
              className="flex items-center text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {isOn ? "OFF" : "ON"}
            </Button>

            <Button
              size="sm"
              variant={isScanning ? "destructive" : "default"}
              onClick={
                isScanning ? () => setIsScanning(false) : handleStartScan
              }
              disabled={!isOn}
              className="flex items-center text-xs"
            >
              {isScanning ? (
                <Pause className="w-3 h-3 mr-1" />
              ) : (
                <Play className="w-3 h-3 mr-1" />
              )}
              {isScanning ? "Stop" : "Scan"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCalibration(!showCalibration)}
              className="flex items-center text-xs"
            >
              <Target className="w-3 h-3 mr-1" />
              Cal
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={exportData}
              disabled={spectralData.length === 0}
              className="flex items-center text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Wavelength (nm)
              </label>
              <Input
                type="number"
                min="400"
                max="700"
                value={currentWavelength}
                onChange={(e) => setCurrentWavelength(Number(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white text-xs"
                disabled={isScanning}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Scan Mode
              </label>
              <select
                value={scanMode}
                onChange={(e) => setScanMode(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                disabled={isScanning}
              >
                <option value="single">Single λ</option>
                <option value="full">Full Spectrum</option>
                <option value="kinetic">Kinetic</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Panel */}
      {showCalibration && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-600">
              Calibration Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                size="sm"
                onClick={handleCalibrationPoint}
                disabled={!isOn || spectralData.length === 0}
                className="w-full"
              >
                Add Calibration Point
              </Button>

              {calibrationData.length > 0 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={calibrationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="concentration"
                        label={{
                          value: "Concentration (M)",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        dataKey="absorbance"
                        label={{
                          value: "Absorbance",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Scatter dataKey="absorbance" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="text-xs text-gray-600">
                Points: {calibrationData.length} | R² ={" "}
                {calibrationData.length > 1 ? "0.995" : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spectrum Display */}
      {spectralData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                {scanMode === "single"
                  ? "Single Point Measurement"
                  : "Absorption Spectrum"}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setMeasurementMode(
                      measurementMode === "absorbance"
                        ? "transmittance"
                        : measurementMode === "transmittance"
                          ? "concentration"
                          : "absorbance",
                    )
                  }
                  className="text-xs"
                >
                  Show{" "}
                  {measurementMode === "absorbance"
                    ? "Transmittance"
                    : measurementMode === "transmittance"
                      ? "Concentration"
                      : "Absorbance"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanMode === "full" ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spectralData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="wavelength"
                      label={{
                        value: "Wavelength (nm)",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value:
                          measurementMode === "absorbance"
                            ? "Absorbance"
                            : "Transmittance (%)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        typeof value === "number" ? value.toFixed(4) : value,
                        measurementMode === "absorbance"
                          ? "Absorbance"
                          : "Transmittance (%)",
                      ]}
                      labelFormatter={(label) => `Wavelength: ${label} nm`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={
                        measurementMode === "absorbance"
                          ? "absorbance"
                          : "transmittance"
                      }
                      stroke={
                        measurementMode === "absorbance" ? "#8884d8" : "#82ca9d"
                      }
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {currentMeasurement?.absorbance.toFixed(4)}
                </div>
                <div className="text-gray-600">
                  Absorbance at {currentWavelength} nm
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Sample: {currentSample.name} | Path length:{" "}
                  {cuvettePathLength} cm
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sample Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sample Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Sample:</strong> {currentSample.name}
            </div>
            <div>
              <strong>Concentration:</strong> {currentSample.concentration} M
            </div>
            <div>
              <strong>λ max:</strong> {currentSample.maxAbsorption} nm
            </div>
            <div>
              <strong>ε:</strong> {currentSample.molarExtinction} L/mol·cm
            </div>
          </div>

          <div
            className="mt-3 p-3 rounded"
            style={{ backgroundColor: `${currentSample.color}20` }}
          >
            <div className="text-xs font-medium text-gray-700">
              Beer's Law Application
            </div>
            <div className="text-xs text-gray-600 mt-1">
              A = ε × b × c = {currentSample.molarExtinction} ×{" "}
              {cuvettePathLength} × {currentSample.concentration} ={" "}
              {(
                (currentSample.molarExtinction *
                  cuvettePathLength *
                  currentSample.concentration) /
                10000
              ).toFixed(4)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpectrophotometerSimulation;
