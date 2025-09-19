"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useOptimization } from "../hooks/use-optimization";
import type {
  OptimizationResult,
  SchedulingCriteria,
  DateRange,
  OptimizationObjective,
  ObjectiveType,
  ScheduleChange
} from "../dal/schedules-types";

interface ScheduleOptimizerProps {
  salonId: string;
  dateRange: DateRange;
  onOptimizationComplete?: (result: OptimizationResult) => void;
  onChangesApplied?: (changes: ScheduleChange[]) => void;
  className?: string;
}

interface OptimizationPreview {
  isOpen: boolean;
  result: OptimizationResult | null;
}

const objectiveLabels: Record<ObjectiveType, string> = {
  maximize_utilization: "Maximize Staff Utilization",
  minimize_wait_time: "Minimize Customer Wait Time",
  maximize_revenue: "Maximize Revenue",
  balance_workload: "Balance Staff Workload",
  minimize_travel_time: "Minimize Travel Time",
  maximize_satisfaction: "Maximize Customer Satisfaction"
};

const objectiveDescriptions: Record<ObjectiveType, string> = {
  maximize_utilization: "Ensure staff members are efficiently scheduled to minimize idle time",
  minimize_wait_time: "Reduce the time customers spend waiting between appointments",
  maximize_revenue: "Optimize scheduling to maximize revenue per hour",
  balance_workload: "Distribute work evenly across all staff members",
  minimize_travel_time: "Reduce time between appointments for mobile services",
  maximize_satisfaction: "Prioritize customer preferences and convenience"
};

/**
 * Schedule optimization tools and suggestions interface
 */
export function ScheduleOptimizer({
  salonId,
  dateRange,
  onOptimizationComplete,
  onChangesApplied,
  className
}: ScheduleOptimizerProps) {
  const [activeTab, setActiveTab] = useState("objectives");
  const [previewDialog, setPreviewDialog] = useState<OptimizationPreview>({
    isOpen: false,
    result: null
  });

  const {
    isOptimizing,
    lastResult,
    optimizationHistory,
    currentCriteria,
    optimizeSchedule,
    updateCriteria,
    addObjective,
    removeObjective,
    updateObjective,
    getOptimizationScore,
    getImprovementSummary,
    canAutoApplyChanges,
    applyPreset,
    resetCriteria
  } = useOptimization({
    onOptimizationComplete,
    onError: (error) => {
      console.error('Optimization error:', error);
    }
  });

  // Run optimization
  const runOptimization = useCallback(async () => {
    const result = await optimizeSchedule(salonId, dateRange);
    if (result) {
      setPreviewDialog({
        isOpen: true,
        result
      });
    }
  }, [optimizeSchedule, salonId, dateRange]);

  // Apply optimization changes
  const applyChanges = useCallback(() => {
    if (previewDialog.result?.suggestedChanges) {
      onChangesApplied?.(previewDialog.result.suggestedChanges);
      setPreviewDialog({ isOpen: false, result: null });
    }
  }, [previewDialog.result, onChangesApplied]);

  // Render objective control
  const renderObjectiveControl = useCallback((objective: OptimizationObjective) => (
    <Card key={objective.type} className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium">{objectiveLabels[objective.type]}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {objectiveDescriptions[objective.type]}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeObjective(objective.type)}
          >
            Remove
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm">Weight: {Math.round(objective.weight * 100)}%</Label>
            <Slider
              value={[objective.weight * 100]}
              onValueChange={([value]) =>
                updateObjective(objective.type, { weight: value / 100 })
              }
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          {objective.target !== undefined && (
            <div>
              <Label className="text-sm">Target: {objective.target}</Label>
              <Slider
                value={[objective.target]}
                onValueChange={([value]) =>
                  updateObjective(objective.type, { target: value })
                }
                max={objective.type.includes('rate') ? 1 : 100}
                step={objective.type.includes('rate') ? 0.05 : 5}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  ), [updateObjective, removeObjective]);

  // Render optimization result summary
  const renderResultSummary = useCallback((result: OptimizationResult) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(result.score)}
            </div>
            <p className="text-xs text-muted-foreground">Optimization Score</p>
            <Progress value={result.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {result.improvements.length}
            </div>
            <p className="text-xs text-muted-foreground">Improvements</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {result.suggestedChanges.length}
            </div>
            <p className="text-xs text-muted-foreground">Suggested Changes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {result.conflicts.length}
            </div>
            <p className="text-xs text-muted-foreground">Remaining Conflicts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.improvements.map((improvement, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{objectiveLabels[improvement.type]}</span>
                  <Badge variant="outline" className="text-green-600">
                    +{Math.round(improvement.improvement * 100)}%
                  </Badge>
                </div>
              ))}
              {result.improvements.length === 0 && (
                <p className="text-sm text-gray-500">No improvements identified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Staff Utilization</span>
                <span className="font-medium">{Math.round(result.metrics.utilizationRate * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Wait Time</span>
                <span className="font-medium">{result.metrics.averageWaitTime}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Workload Balance</span>
                <span className="font-medium">{Math.round(result.metrics.workloadBalance * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="font-medium">{result.metrics.customerSatisfaction}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ), []);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Schedule Optimizer</CardTitle>
            <div className="flex items-center space-x-2">
              {lastResult && (
                <Badge variant="outline" className="text-green-600">
                  Score: {Math.round(getOptimizationScore())}
                </Badge>
              )}
              <Button
                onClick={runOptimization}
                disabled={isOptimizing}
                className="min-w-[120px]"
              >
                {isOptimizing ? "Optimizing..." : "Optimize Schedule"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="objectives">Objectives</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Objectives Tab */}
            <TabsContent value="objectives" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Optimization Objectives</h3>
                <Button variant="outline" size="sm" onClick={resetCriteria}>
                  Reset to Defaults
                </Button>
              </div>

              <div className="space-y-4">
                {currentCriteria?.objectives.map(renderObjectiveControl)}
                {!currentCriteria?.objectives.length && (
                  <div className="text-center py-8 text-gray-500">
                    No objectives configured. Use presets to get started.
                  </div>
                )}
              </div>

              {/* Add objective section */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Add Objective</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(objectiveLabels).map(([type, label]) => {
                    const isActive = currentCriteria?.objectives.some(obj => obj.type === type);
                    return (
                      <Button
                        key={type}
                        variant={isActive ? "secondary" : "outline"}
                        size="sm"
                        disabled={isActive}
                        onClick={() => addObjective({
                          type: type as ObjectiveType,
                          weight: 0.25,
                          target: type.includes('rate') ? 0.8 : 80
                        })}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* Presets Tab */}
            <TabsContent value="presets" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => applyPreset('balanced')}>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Balanced Optimization</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Equal focus on utilization, revenue, wait time, and satisfaction
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>• Utilization: 25%</div>
                      <div>• Revenue: 25%</div>
                      <div>• Wait Time: 25%</div>
                      <div>• Satisfaction: 25%</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => applyPreset('revenue')}>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Revenue Maximization</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Prioritize revenue generation and high utilization
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>• Revenue: 50%</div>
                      <div>• Utilization: 30%</div>
                      <div>• Wait Time: 20%</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => applyPreset('utilization')}>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Utilization Focus</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Maximize staff efficiency and workload balance
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>• Utilization: 60%</div>
                      <div>• Workload Balance: 30%</div>
                      <div>• Wait Time: 10%</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => applyPreset('satisfaction')}>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Customer Satisfaction</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Prioritize customer experience and minimal wait times
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>• Satisfaction: 40%</div>
                      <div>• Wait Time: 30%</div>
                      <div>• Utilization: 20%</div>
                      <div>• Workload Balance: 10%</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {lastResult ? (
                <>
                  {renderResultSummary(lastResult)}

                  {lastResult.suggestedChanges.length > 0 && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Suggested Changes</CardTitle>
                          <div className="flex items-center space-x-2">
                            {canAutoApplyChanges() && (
                              <Badge variant="outline" className="text-green-600">
                                Safe to Auto-Apply
                              </Badge>
                            )}
                            <Button
                              onClick={() => setPreviewDialog({ isOpen: true, result: lastResult })}
                            >
                              Preview Changes
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {lastResult.suggestedChanges.slice(0, 5).map((change, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {change.changeType}
                                  </Badge>
                                  <span className="text-sm font-medium">{change.reason}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Impact: {change.impact.satisfactionScore}% satisfaction,
                                  ${change.impact.revenueImpact} revenue
                                </div>
                              </div>
                            </div>
                          ))}
                          {lastResult.suggestedChanges.length > 5 && (
                            <p className="text-sm text-gray-500 text-center">
                              ...and {lastResult.suggestedChanges.length - 5} more changes
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No Optimization Results</h3>
                  <p className="text-gray-600 mb-4">
                    Run an optimization to see suggestions and improvements
                  </p>
                  <Button onClick={runOptimization} disabled={isOptimizing}>
                    {isOptimizing ? "Optimizing..." : "Run Optimization"}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              {optimizationHistory.length > 0 ? (
                <div className="space-y-4">
                  {optimizationHistory.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">
                              Score: {Math.round(result.score)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {result.improvements.length} improvements
                            </span>
                            <span className="text-sm text-gray-600">
                              {result.suggestedChanges.length} changes
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {result.executionTime}ms
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No optimization history available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Optimization preview dialog */}
      <Dialog open={previewDialog.isOpen} onOpenChange={(open) =>
        setPreviewDialog({ isOpen: open, result: previewDialog.result })
      }>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Optimization Preview</DialogTitle>
            <DialogDescription>
              Review the optimization results before applying changes
            </DialogDescription>
          </DialogHeader>

          {previewDialog.result && (
            <div className="space-y-6">
              {renderResultSummary(previewDialog.result)}

              {previewDialog.result.suggestedChanges.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">All Suggested Changes</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {previewDialog.result.suggestedChanges.map((change, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {change.changeType}
                            </Badge>
                            <span className="font-medium">{change.reason}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Satisfaction: {change.impact.satisfactionScore}% |
                            Revenue: ${change.impact.revenueImpact} |
                            Time: {change.impact.timeImpact}min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog({ isOpen: false, result: null })}>
              Cancel
            </Button>
            <Button onClick={applyChanges}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}