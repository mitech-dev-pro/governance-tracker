"use client";

import React from "react";
import { Risk, getRiskColor } from "../types/risk";

interface RiskMatrixProps {
  risks: Risk[];
  onRiskClick?: (risk: Risk) => void;
}

export default function RiskMatrix({ risks, onRiskClick }: RiskMatrixProps) {
  // Group risks by their impact and likelihood
  const getRisksAtPosition = (impact: number, likelihood: number) => {
    return risks.filter(
      (r) => r.impact === impact && r.likelihood === likelihood
    );
  };

  const getCellColor = (impact: number, likelihood: number) => {
    const rating = impact * likelihood;
    const color = getRiskColor(rating);

    const colorMap: Record<string, string> = {
      red: "bg-red-100 border-red-300",
      orange: "bg-orange-100 border-orange-300",
      yellow: "bg-yellow-100 border-yellow-300",
      lime: "bg-lime-100 border-lime-300",
      green: "bg-green-100 border-green-300",
    };

    return colorMap[color] || "bg-gray-50 border-gray-200";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Matrix</h3>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Matrix Header */}
          <div className="flex items-center mb-2">
            <div className="w-24"></div>
            <div className="flex-1 text-center font-semibold text-sm text-gray-700">
              Likelihood →
            </div>
          </div>

          <div className="flex">
            {/* Y-axis label */}
            <div className="flex flex-col justify-center items-center w-24 pr-2">
              <div className="transform -rotate-90 whitespace-nowrap font-semibold text-sm text-gray-700">
                Impact →
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="flex-1">
              {/* Likelihood Labels */}
              <div className="grid grid-cols-5 gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <div
                    key={l}
                    className="text-center text-xs font-medium text-gray-600 py-1"
                  >
                    {l}
                  </div>
                ))}
              </div>

              {/* Matrix Cells - Reverse order for Impact (5 at top, 1 at bottom) */}
              {[5, 4, 3, 2, 1].map((impact) => (
                <div key={impact} className="grid grid-cols-5 gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((likelihood) => {
                    const cellRisks = getRisksAtPosition(impact, likelihood);
                    const rating = impact * likelihood;
                    const cellColor = getCellColor(impact, likelihood);

                    return (
                      <div
                        key={`${impact}-${likelihood}`}
                        className={`relative border-2 rounded p-2 min-h-[80px] transition-all ${cellColor} ${
                          cellRisks.length > 0
                            ? "hover:shadow-md cursor-pointer"
                            : ""
                        }`}
                        title={`Impact: ${impact}, Likelihood: ${likelihood}, Rating: ${rating}`}
                      >
                        {/* Rating badge in corner */}
                        <div className="absolute top-1 right-1 text-xs font-bold text-gray-500">
                          {rating}
                        </div>

                        {/* Impact label on left edge */}
                        {likelihood === 1 && (
                          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-600">
                            {impact}
                          </div>
                        )}

                        {/* Risks in this cell */}
                        {cellRisks.length > 0 && (
                          <div className="mt-4 space-y-1">
                            {cellRisks.slice(0, 2).map((risk) => (
                              <div
                                key={risk.id}
                                onClick={() => onRiskClick && onRiskClick(risk)}
                                className="text-xs bg-white bg-opacity-80 rounded px-2 py-1 truncate hover:bg-opacity-100"
                                title={risk.title}
                              >
                                {risk.title}
                              </div>
                            ))}
                            {cellRisks.length > 2 && (
                              <div className="text-xs text-gray-600 text-center">
                                +{cellRisks.length - 2} more
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show count badge if risks exist */}
                        {cellRisks.length > 0 && (
                          <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {cellRisks.length}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs">
            <span className="font-semibold">Risk Level:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span>Very Low (1-4)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-lime-100 border-2 border-lime-300 rounded"></div>
              <span>Low (5-9)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
              <span>Medium (10-14)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
              <span>High (15-19)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
              <span>Critical (20-25)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
