import React, { useState } from "react";
import { 
  PlusCircle, AlertTriangle, Activity, Sparkles, Navigation, Clock, CheckCircle2, 
  MapPin, Phone, Users, ShieldAlert, ArrowRight, HeartHandshake, FileText, Send, RefreshCw, Eye
} from "lucide-react";
import { BloodGroup, BloodRequest, Donor } from "../types";

interface HospitalDashboardProps {
  requestsList: BloodRequest[];
  onCreateRequest: (req: Partial<BloodRequest>) => void;
  onUpdateRequestStatus: (requestId: string, status: BloodRequest["status"], donorId?: string) => void;
  donorsList: Donor[];
  onSelectRequestForTracking: (req: BloodRequest) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  requestsList,
  onCreateRequest,
  onUpdateRequestStatus,
  donorsList,
  onSelectRequestForTracking
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedPriorityTab, setSelectedPriorityTab] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM">("ALL");

  // Emergency request form state
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O-");
  const [hospitalName, setHospitalName] = useState("California Pacific Medical Center");
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [urgency, setUrgency] = useState<"CRITICAL" | "HIGH" | "MEDIUM">("CRITICAL");
  const [reason, setReason] = useState("");
  const [contactPhone, setContactPhone] = useState("+1 (555) 911-0000");

  // AI Demand Prediction state
  const [predictingDemand, setPredictingDemand] = useState<boolean>(false);
  const [icuOccupancy, setIcuOccupancy] = useState<number>(88);
  const [plannedSurgeries, setPlannedSurgeries] = useState<number>(14);
  const [traumaAlertLevel, setTraumaAlertLevel] = useState<string>("Elevated");
  const [daysAhead, setDaysAhead] = useState<number>(7);
  const [aiPrediction, setAiPrediction] = useState<any>(null);

  // Quick allocation modal state
  const [allocatingRequest, setAllocatingRequest] = useState<BloodRequest | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !reason) {
      alert("Please enter patient name and clinical reason.");
      return;
    }

    onCreateRequest({
      patientName,
      bloodGroup,
      hospitalName,
      unitsNeeded,
      urgency,
      reason,
      status: "Broadcasting",
      latitude: 37.7760,
      longitude: -122.4140,
      contactPhone,
      createdAt: new Date().toISOString()
    });

    // Reset form
    setPatientName("");
    setReason("");
    setShowCreateModal(false);
  };

  const handleRunAiPrediction = async () => {
    setPredictingDemand(true);
    try {
      const res = await fetch("/api/gemini/predict-demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName,
          icuOccupancy,
          plannedSurgeries,
          traumaAlertLevel,
          daysAhead
        })
      });
      const data = await res.json();
      setAiPrediction(data);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setPredictingDemand(false);
    }
  };

  const filteredRequests = requestsList.filter((r) => {
    if (selectedPriorityTab === "ALL") return true;
    return r.urgency === selectedPriorityTab;
  });

  const criticalCount = requestsList.filter((r) => r.urgency === "CRITICAL").length;
  const highCount = requestsList.filter((r) => r.urgency === "HIGH").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Dashboard Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-rose-900 text-white rounded-2xl p-6 shadow-xl border border-red-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-200 font-semibold text-xs tracking-wider uppercase mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Hospital Clinical Operations Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hospital Emergency Management Dashboard</h1>
          <p className="text-red-100/90 text-sm mt-1 max-w-2xl">
            Dispatch urgent blood requests, forecast blood group demands using AI, monitor patient clinical triage, and track live GPS delivery in real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-red-600" />
            New Emergency Request
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Requests</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{requestsList.length}</h3>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-emerald-600 font-medium">Broadcasting live</span> across regional donor network
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical Trauma Triage</p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalCount}</h3>
            </div>
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-lg">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            High-priority STAT cases needing immediate allocation
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">High Urgency Requests</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{highCount}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Surgical & ICU reserve requests
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Matched & En Route</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {requestsList.filter(r => r.status === "Matched" || r.status === "EnRoute").length}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Live GPS tracking active for couriers/donors
          </div>
        </div>
      </div>

      {/* Main Section Grid: Clinical Triage Board + AI Demand Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Requests & Clinical Triage Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  Clinical Patient Priority & Emergency Status Tracking
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monitor live emergency blood requests, status transitions, and dispatch progress
                </p>
              </div>

              {/* Urgency Filter Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
                {(["ALL", "CRITICAL", "HIGH", "MEDIUM"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedPriorityTab(tab)}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      selectedPriorityTab === tab
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Cards List */}
            <div className="mt-4 space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No requests matching selected priority filter.
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-red-200 dark:hover:border-red-900 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.urgency === "CRITICAL"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse"
                            : req.urgency === "HIGH"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}>
                          {req.urgency} PRIORITY
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{req.patientName}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Status:</span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          req.status === "Broadcasting" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                          req.status === "Matched" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                          req.status === "EnRoute" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                          req.status === "Arrived" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" :
                          req.status === "Completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                          "bg-slate-200 text-slate-700"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block">Required Group</span>
                        <span className="font-extrabold text-red-600 text-sm">{req.bloodGroup}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Units Needed</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{req.unitsNeeded} Units</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Hospital</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{req.hospitalName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Contact</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{req.contactPhone || "Emergency Desk"}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{req.reason}"
                    </p>

                    {/* Status Pipeline Visualizer */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                        <span>Broadcasting</span>
                        <span>Donor Matched</span>
                        <span>En Route</span>
                        <span>Arrived Hospital</span>
                        <span>Completed</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                        <div className={`h-full transition-all duration-500 ${
                          req.status === "Broadcasting" ? "w-1/5 bg-amber-500" :
                          req.status === "Matched" ? "w-2/5 bg-blue-500" :
                          req.status === "EnRoute" ? "w-3/5 bg-purple-500" :
                          req.status === "Arrived" ? "w-4/5 bg-indigo-500" :
                          req.status === "Completed" ? "w-full bg-emerald-500" :
                          "w-0 bg-slate-400"
                        }`} />
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectRequestForTracking(req)}
                          className="flex items-center gap-1.5 text-xs bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 font-semibold px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5 text-red-600" />
                          Live GPS Blood Tracking
                        </button>
                      </div>

                      {/* Status Transition Select */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">Update Status:</span>
                        <select
                          value={req.status}
                          onChange={(e) => onUpdateRequestStatus(req.id, e.target.value as BloodRequest["status"])}
                          className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                          <option value="Broadcasting">Broadcasting</option>
                          <option value="Matched">Matched</option>
                          <option value="EnRoute">EnRoute</option>
                          <option value="Arrived">Arrived</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI-Based Future Blood Demand Prediction */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                AI Future Blood Demand Predictor
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Gemini 3.5 AI
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate clinical factors (ICU occupancy, surgeries, trauma level) to forecast blood unit requirements 7 to 30 days ahead.
            </p>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">ICU Occupancy Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white">{icuOccupancy}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={icuOccupancy}
                  onChange={(e) => setIcuOccupancy(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Upcoming Scheduled Surgeries</span>
                  <span className="font-bold text-slate-900 dark:text-white">{plannedSurgeries} cases</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={plannedSurgeries}
                  onChange={(e) => setPlannedSurgeries(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Trauma Alert Level</label>
                <select
                  value={traumaAlertLevel}
                  onChange={(e) => setTraumaAlertLevel(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-medium"
                >
                  <option value="Normal">Normal Seasonal Baseline</option>
                  <option value="Elevated">Elevated (Holiday Weekend / Event)</option>
                  <option value="Mass Casualty Alert">Mass Casualty Emergency Level</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Forecast Window</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDaysAhead(7)}
                    className={`py-1 rounded font-semibold text-center transition-all ${
                      daysAhead === 7 ? "bg-red-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    7-Day Forecast
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaysAhead(30)}
                    className={`py-1 rounded font-semibold text-center transition-all ${
                      daysAhead === 30 ? "bg-red-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    30-Day Forecast
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunAiPrediction}
                disabled={predictingDemand}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {predictingDemand ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calculating AI Demand...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Forecast Future Demand
                  </>
                )}
              </button>
            </div>

            {/* AI Prediction Output */}
            {aiPrediction && (
              <div className="space-y-3 bg-red-50/50 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-900/50 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900 dark:text-red-300">
                    Risk Assessment: {aiPrediction.riskLevel}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {aiPrediction.forecastPeriod}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {aiPrediction.summary}
                </p>

                {/* Forecast Matrix Table */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Predicted Group Breakdown:</span>
                  <div className="space-y-1.5">
                    {aiPrediction.bloodTypeForecast?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-red-600 text-sm">{item.bloodGroup}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.predictedUnits} Units</span>
                        <span className="text-[10px] text-slate-500">{item.confidence}% confidence</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 rounded-lg text-amber-900 dark:text-amber-200 text-[11px] font-semibold border border-amber-200 dark:border-amber-900">
                  ⚡ AI Recommended Action: {aiPrediction.recommendedAction}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Request Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-600" />
                Create Hospital Emergency Blood Request
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Trauma Case #402"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Blood Group Needed</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-extrabold text-red-600"
                  >
                    {(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as BloodGroup[]).map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Units Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Patient Priority Triage</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="CRITICAL">CRITICAL (STAT Emergency)</option>
                    <option value="HIGH">HIGH (Urgent Surgical)</option>
                    <option value="MEDIUM">MEDIUM (Standard Scheduled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Hospital / Medical Center</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Clinical Diagnosis & Reason</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Acute hemorrhagic shock post traffic collision. Hemoglobin levels < 6.5 g/dL."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Broadcast Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
