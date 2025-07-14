import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Power,
  Zap,
  Droplets,
  TrendingUp,
  AlertTriangle,
  Settings,
  Wifi,
  Battery,
} from "lucide-react";

interface PHMeterProps {
  currentPH?: number;
  isCalibrated?: boolean;
  onCalibrate?: () => void;
  isConnected?: boolean;
  solutionName?: string;
  temperature?: number;
  onMeasurement?: (ph: number, accuracy: number) => void;
}

interface CalibrationPoint {
  ph: number;
  label: string;
  color: string;
}

export const PHMeterSimulation: React.FC<PHMeterProps> = ({
  currentPH = 7.0,
  isCalibrated = false,
  onCalibrate,
  isConnected = true,
  solutionName = "Unknown Solution",
  temperature = 25,
  onMeasurement,
}) => {
  const [isOn, setIsOn] = useState(false);
  const [displayPH, setDisplayPH] = useState<number | null>(null);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [accuracy, setAccuracy] = useState(0.01);
  const [measurementHistory, setMeasurementHistory] = useState<
    Array<{
      ph: number;
      time: string;
      accuracy: number;
    }>
  >([]);

  const calibrationPoints: CalibrationPoint[] = [
    { ph: 4.01, label: "Buffer pH 4.01", color: "#ef4444" },
    { ph: 7.0, label: "Buffer pH 7.00", color: "#10b981" },
    { ph: 10.01, label: "Buffer pH 10.01", color: "#3b82f6" },
  ];

  useEffect(() => {
    if (isOn && !calibrationMode) {
      const interval = setInterval(() => {
        // Simulate realistic pH reading with drift and noise
        const drift = (Math.random() - 0.5) * 0.02;
        const noise = (Math.random() - 0.5) * 0.01;
        const tempCorrection = (temperature - 25) * 0.003; // Temperature compensation

        let measuredPH = currentPH + drift + noise + tempCorrection;

        // Add accuracy based on calibration
        if (!isCalibrated) {
          measuredPH += (Math.random() - 0.5) * 0.2; // Less accurate when not calibrated
          setAccuracy(0.1);
        } else {
          setAccuracy(0.01);
        }

        setDisplayPH(Number(measuredPH.toFixed(2)));

        // Decrease battery slowly
        setBatteryLevel((prev) => Math.max(0, prev - 0.01));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOn, currentPH, temperature, isCalibrated, calibrationMode]);

  const handlePowerToggle = () => {
    setIsOn(!isOn);
    if (!isOn) {
      setIsStabilizing(true);
      setTimeout(() => setIsStabilizing(false), 3000);
    } else {
      setDisplayPH(null);
      setIsStabilizing(false);
    }
  };

  const handleMeasure = () => {
    if (isOn && displayPH !== null && !isStabilizing) {
      const measurement = {
        ph: displayPH,
        time: new Date().toLocaleTimeString(),
        accuracy: accuracy,
      };

      setMeasurementHistory((prev) => [...prev.slice(-9), measurement]);

      if (onMeasurement) {
        onMeasurement(displayPH, accuracy);
      }
    }
  };

  const handleCalibration = () => {
    setCalibrationMode(true);
    setIsStabilizing(true);

    setTimeout(() => {
      setIsStabilizing(false);
      setCalibrationMode(false);
      if (onCalibrate) {
        onCalibrate();
      }
    }, 5000);
  };

  const getPHColor = (ph: number) => {
    if (ph < 7) return "#ef4444"; // Red for acidic
    if (ph > 7) return "#3b82f6"; // Blue for basic
    return "#10b981"; // Green for neutral
  };

  const getPHCategory = (ph: number) => {
    if (ph < 3) return "Strongly Acidic";
    if (ph < 7) return "Acidic";
    if (ph === 7) return "Neutral";
    if (ph < 11) return "Basic";
    return "Strongly Basic";
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Main pH Meter Display */}
      <Card className="w-80 bg-gray-900 text-white border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-blue-400" />
              pH Meter Pro
            </span>
            <div className="flex items-center space-x-2">
              <Badge
                variant={isConnected ? "default" : "destructive"}
                className="text-xs"
              >
                <Wifi className="w-3 h-3 mr-1" />
                {isConnected ? "Connected" : "Offline"}
              </Badge>
              <Badge
                variant={batteryLevel > 20 ? "default" : "destructive"}
                className="text-xs"
              >
                <Battery className="w-3 h-3 mr-1" />
                {batteryLevel.toFixed(0)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Display */}
          <div className="bg-black rounded-lg p-6 text-center border border-gray-600">
            {!isOn ? (
              <div className="text-gray-500 text-lg">--- OFF ---</div>
            ) : isStabilizing ? (
              <div className="text-yellow-400 text-lg animate-pulse">
                Stabilizing...
              </div>
            ) : displayPH !== null ? (
              <div>
                <div
                  className="text-4xl font-mono font-bold"
                  style={{ color: getPHColor(displayPH) }}
                >
                  {displayPH.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400 mt-1">pH units</div>
                <div className="text-xs text-blue-400 mt-1">
                  {getPHCategory(displayPH)}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-lg">Reading...</div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${isCalibrated ? "bg-green-400" : "bg-red-400"}`}
              />
              {isCalibrated ? "Calibrated" : "Not Calibrated"}
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-2 bg-blue-400" />
              Temp: {temperature}°C
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant={isOn ? "destructive" : "default"}
              onClick={handlePowerToggle}
              className="flex items-center text-xs"
            >
              <Power className="w-3 h-3 mr-1" />
              {isOn ? "OFF" : "ON"}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleMeasure}
              disabled={!isOn || isStabilizing}
              className="flex items-center text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Measure
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCalibration}
              disabled={!isOn || calibrationMode}
              className="flex items-center text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              {calibrationMode ? "Cal..." : "Cal"}
            </Button>
          </div>

          {/* Accuracy Display */}
          {isOn && displayPH !== null && (
            <div className="text-center text-xs text-gray-400">
              Accuracy: ±{accuracy} pH units
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calibration Panel */}
      {calibrationMode && (
        <Card className="w-80 border-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-600 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Calibration Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Place electrode in calibration buffer and wait for stable
                reading.
              </p>
              {calibrationPoints.map((point) => (
                <div
                  key={point.ph}
                  className="flex items-center justify-between p-2 rounded bg-gray-50"
                >
                  <span className="text-sm font-medium">{point.label}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: point.color }}
                  />
                </div>
              ))}
              <div className="text-xs text-gray-500 text-center">
                Calibrating with 3-point buffer system...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Measurement History */}
      {measurementHistory.length > 0 && (
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Measurement Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {measurementHistory
                .slice()
                .reverse()
                .map((measurement, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                  >
                    <span
                      className="font-mono font-bold"
                      style={{ color: getPHColor(measurement.ph) }}
                    >
                      pH {measurement.ph}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {measurement.time}
                    </span>
                  </div>
                ))}
            </div>
            {measurementHistory.length >= 10 && (
              <div className="text-xs text-gray-500 text-center mt-2">
                Showing last 10 measurements
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PHMeterSimulation;
