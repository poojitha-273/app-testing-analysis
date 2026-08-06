import React, { useState } from "react";
import { 
  Database, AlertCircle, Clock, CheckCircle, Plus, Minus, Sparkles, 
  Users, Search, ShieldCheck, RefreshCw, BarChart3, Thermometer, FileCheck, ArrowUpRight
} from "lucide-react";
import { BloodGroup, BloodRequest, Donor } from "../types";

interface InventoryItem {
  bloodGroup: BloodGroup;
  units: number;
  wholeBlood: number;
  prbc: number;
  platelets: number;
  plasma: number;
  temperature: string;
  expiringIn7Days: number;
  status: "OPTIMAL" | "LOW" | "CRITICAL";
}

interface BloodBankDashboardProps {
  requestsList: BloodRequest[];
  onAllocateStockToRequest: (requestId: string, units: number) => void;
  donorsList: Donor[];
}

export const BloodBankDashboard: React.FC<BloodBankDashboardProps> = ({
  requestsList,
  onAllocateStockToRequest,
  donorsList
}) => {
  // Inventory State across all 8 blood groups
  const [inventory, setInventory] = useState<Record<BloodGroup, InventoryItem>>({
    "O-": { bloodGroup: "O-", units: 2, wholeBlood: 1, prbc: 1, platelets: 0, plasma: 0, temperature: "3.2°C", expiringIn7Days: 1, status: "CRITICAL" },
    "O+": { bloodGroup: "O+", units: 18, wholeBlood: 8, prbc: 6, platelets: 2, plasma: 2, temperature: "4.0°C", expiringIn7Days: 2, status: "OPTIMAL" },
    "A-": { bloodGroup: "A-", units: 4, wholeBlood: 2, prbc: 1, platelets: 1, plasma: 0, temperature: "3.5°C", expiringIn7Days: 1, status: "LOW" },
    "A+": { bloodGroup: "A+", units: 22, wholeBlood: 10, prbc: 8, platelets: 2, plasma: 2, temperature: "3.8°C", expiringIn7Days: 4, status: "OPTIMAL" },
    "B-": { bloodGroup: "B-", units: 3, wholeBlood: 1, prbc: 1, platelets: 1, plasma: 0, temperature: "3.6°C", expiringIn7Days: 0, status: "LOW" },
    "B+": { bloodGroup: "B+", units: 14, wholeBlood: 6, prbc: 5, platelets: 2, plasma: 1, temperature: "4.1°C", expiringIn7Days: 2, status: "OPTIMAL" },
    "AB-": { bloodGroup: "AB-", units: 1, wholeBlood: 0, prbc: 1, platelets: 0, plasma: 0, temperature: "3.4°C", expiringIn7Days: 1, status: "CRITICAL" },
    "AB+": { bloodGroup: "AB+", units: 12, wholeBlood: 4, prbc: 4, platelets: 2, plasma: 2, temperature: "3.9°C", expiringIn7Days: 2, status: "OPTIMAL" }
  });

  const [activeTab, setActiveTab] = useState<"inventory" | "allocation" | "fda_screening" | "ai_recommendations" | "donors">("inventory");
  const [searchDonorTerm, setSearchDonorTerm] = useState("");

  // AI Stock Recommendations state
  const [loadingAiRecs, setLoadingAiRecs] = useState(false);
  const [aiRecData, setAiRecData] = useState<any>(null);

  // FDA Screening Tool state
  const [donorAge, setDonorAge] = useState<number>(28);
  const [donorWeight, setDonorWeight] = useState<number>(68);
  const [hemoglobinLevel, setHemoglobinLevel] = useState<number>(13.5);
  const [lastDonationDays, setLastDonationDays] = useState<number>(90);
  const [recentTravel, setRecentTravel] = useState<boolean>(false);
  const [activeMedications, setActiveMedications] = useState<string>("None");
  const [recentTattoos, setRecentTattoos] = useState<boolean>(false);
  const [fdaResult, setFdaResult] = useState<any>(null);

  const handleAdjustUnits = (bg: BloodGroup, delta: number) => {
    setInventory((prev) => {
      const current = prev[bg];
      const newUnits = Math.max(0, current.units + delta);
      const newStatus = newUnits <= 2 ? "CRITICAL" : newUnits <= 5 ? "LOW" : "OPTIMAL";
      return {
        ...prev,
        [bg]: { ...current, units: newUnits, status: newStatus }
      };
    });
  };

  const handleRunAiStockRec = async () => {
    setLoadingAiRecs(true);
    try {
      const res = await fetch("/api/gemini/stock-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryData: inventory })
      });
      const data = await res.json();
      setAiRecData(data);
    } catch (err) {
      console.error("AI Stock Rec Error:", err);
    } finally {
      setLoadingAiRecs(false);
    }
  };

  const handleEvaluateFdaCriteria = () => {
    let passed = true;
    const flags: string[] = [];

    if (donorAge < 17 || donorAge > 65) {
      passed = false;
      flags.push("Age out of FDA range (17 - 65 yrs required).");
    }
    if (donorWeight < 50) {
      passed = false;
      flags.push("Weight below FDA 50 kg threshold.");
    }
    if (hemoglobinLevel < 12.5) {
      passed = false;
      flags.push(`Hemoglobin level ${hemoglobinLevel} g/dL below FDA minimum 12.5 g/dL.`);
    }
    if (lastDonationDays < 56) {
      passed = false;
      flags.push(`Only ${lastDonationDays} days since last donation (56 days required).`);
    }
    if (recentTattoos) {
      passed = false;
      flags.push("Recent body art procedure within 3-month deferral window.");
    }

    setFdaResult({
      passed,
      flags,
      summary: passed 
        ? "FDA ELIGIBILITY VERIFIED: Donor satisfies all blood banking safety criteria." 
        : "FDA TEMPORARY DEFERRAL: Donor is deferred based on the flagged health indicators.",
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const inventoryValues = Object.values(inventory) as InventoryItem[];
  const totalUnits = inventoryValues.reduce((acc, curr) => acc + curr.units, 0);
  const expiringCount = inventoryValues.reduce((acc, curr) => acc + curr.expiringIn7Days, 0);
  const criticalGroups = inventoryValues.filter(i => i.status === "CRITICAL");

  const filteredDonors = donorsList.filter((d) => 
    d.name.toLowerCase().includes(searchDonorTerm.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(searchDonorTerm.toLowerCase()) ||
    d.locationName.toLowerCase().includes(searchDonorTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Database className="w-4 h-4 text-red-500" />
            Regional Blood Bank Operations & Supply Chain
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Blood Bank Management Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Monitor real-time blood stock, component breakdown, expiry alerts, FDA donor eligibility verification, and AI replenishment analytics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-3 py-2 rounded-lg font-bold transition-all ${
              activeTab === "inventory" ? "bg-red-600 text-white shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            Inventory Management
          </button>
          <button
            onClick={() => setActiveTab("allocation")}
            className={`px-3 py-2 rounded-lg font-bold transition-all ${
              activeTab === "allocation" ? "bg-red-600 text-white shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            Unit Allocation
          </button>
          <button
            onClick={() => setActiveTab("fda_screening")}
            className={`px-3 py-2 rounded-lg font-bold transition-all ${
              activeTab === "fda_screening" ? "bg-red-600 text-white shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            FDA Donor Screening
          </button>
          <button
            onClick={() => setActiveTab("ai_recommendations")}
            className={`px-3 py-2 rounded-lg font-bold transition-all ${
              activeTab === "ai_recommendations" ? "bg-red-600 text-white shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            AI Stock Analytics
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className={`px-3 py-2 rounded-lg font-bold transition-all ${
              activeTab === "donors" ? "bg-red-600 text-white shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            Donor Records
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Blood Stock</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalUnits} Units</h3>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-blue-500" />
            Cold chain temp maintained at <span className="font-semibold text-slate-700 dark:text-slate-300">2°C – 6°C</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Expiring Units (&lt; 7 Days)</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{expiringCount} Units</h3>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Priority dispatch recommended to avoid waste
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical Stock Groups</p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalGroups.length} Types</h3>
            </div>
            <div className="p-2.5 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-red-600 dark:text-red-400 font-semibold">
            {criticalGroups.map(g => g.bloodGroup).join(", ") || "None"} below safe buffer
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Hospital Requests</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{requestsList.length} Requests</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Awaiting stock allocation & courier dispatch
          </div>
        </div>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-red-600" />
                Live Blood Group Stock Matrix & Component Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track available units, component splits (Whole Blood, PRBC, Platelets, Plasma), and cold chain temperature.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventoryValues.map((item) => (
              <div
                key={item.bloodGroup}
                className={`p-4 rounded-xl border transition-all ${
                  item.status === "CRITICAL"
                    ? "border-red-300 bg-red-50/40 dark:bg-red-950/30 dark:border-red-900"
                    : item.status === "LOW"
                    ? "border-amber-300 bg-amber-50/40 dark:bg-amber-950/30 dark:border-amber-900"
                    : "border-slate-200 bg-white dark:bg-slate-800/60 dark:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-extrabold text-red-600 dark:text-red-400">{item.bloodGroup}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === "CRITICAL" ? "bg-red-600 text-white" :
                    item.status === "LOW" ? "bg-amber-500 text-white" :
                    "bg-emerald-600 text-white"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between my-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{item.units} Units</span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <Thermometer className="w-3 h-3 text-blue-500" />
                    {item.temperature}
                  </span>
                </div>

                {/* Component Breakdown */}
                <div className="text-[11px] space-y-1 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Whole Blood:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.wholeBlood}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>PRBC (Red Cells):</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.prbc}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Platelets:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.platelets}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Fresh Frozen Plasma:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.plasma}</span>
                  </div>
                </div>

                {item.expiringIn7Days > 0 && (
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 mb-3">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {item.expiringIn7Days} unit(s) expiring within 7 days!
                  </div>
                )}

                {/* Quick Stock Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAdjustUnits(item.bloodGroup, -1)}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold py-1 rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5" /> Deduct
                  </button>
                  <button
                    onClick={() => handleAdjustUnits(item.bloodGroup, 1)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1 rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Unit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UNIT ALLOCATION TO HOSPITALS */}
      {activeTab === "allocation" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Smart Blood Unit Allocation & Hospital Reservation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Directly reserve and allocate physical bank stock to hospital emergency broadcasts.
            </p>
          </div>

          <div className="space-y-3">
            {requestsList.map((req) => {
              const availableUnitsInBank = inventory[req.bloodGroup]?.units || 0;
              const isAllocatable = availableUnitsInBank >= req.unitsNeeded;

              return (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-red-600 text-lg">{req.bloodGroup}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{req.patientName}</span>
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-2 py-0.5 rounded">
                        {req.hospitalName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Units Requested: <strong className="text-slate-800 dark:text-slate-200">{req.unitsNeeded}</strong> | Reason: {req.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="block text-slate-500">Bank Stock ({req.bloodGroup}):</span>
                      <span className={`font-bold ${availableUnitsInBank > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {availableUnitsInBank} Units Available
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onAllocateStockToRequest(req.id, req.unitsNeeded);
                        handleAdjustUnits(req.bloodGroup, -req.unitsNeeded);
                        alert(`Successfully allocated ${req.unitsNeeded} unit(s) of ${req.bloodGroup} to ${req.hospitalName}!`);
                      }}
                      disabled={!isAllocatable}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isAllocatable
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {isAllocatable ? "Approve & Dispatch Stock" : "Insufficient Stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FDA DONOR ELIGIBILITY SCREENING */}
      {activeTab === "fda_screening" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              FDA & Red Cross Donor Eligibility Screening Tool
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perform automated clinical screening on donor physiological parameters before blood draw.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Donor Age (Years)</label>
                  <input
                    type="number"
                    value={donorAge}
                    onChange={(e) => setDonorAge(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={donorWeight}
                    onChange={(e) => setDonorWeight(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hemoglobinLevel}
                    onChange={(e) => setHemoglobinLevel(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Days Since Last Donation</label>
                  <input
                    type="number"
                    value={lastDonationDays}
                    onChange={(e) => setLastDonationDays(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={recentTattoos}
                    onChange={(e) => setRecentTattoos(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  Recent Tattoo / Piercing (&lt; 3 months)
                </label>
              </div>

              <button
                onClick={handleEvaluateFdaCriteria}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <FileCheck className="w-4 h-4" />
                Run FDA Eligibility Check
              </button>
            </div>

            {/* FDA Screening Result Display */}
            <div className="space-y-3">
              {fdaResult ? (
                <div className={`p-5 rounded-2xl border ${
                  fdaResult.passed
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
                }`}>
                  <div className="flex items-center gap-2 font-black text-base mb-2">
                    {fdaResult.passed ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                    {fdaResult.summary}
                  </div>

                  {fdaResult.flags.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs">
                      <span className="font-bold block text-slate-800 dark:text-slate-200">Flagged Criteria:</span>
                      <ul className="list-disc list-inside space-y-1">
                        {fdaResult.flags.map((flag: string, idx: number) => (
                          <li key={idx} className="font-medium text-red-700 dark:text-red-300">{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 flex justify-between">
                    <span>Verified by Blood AI FDA Engine</span>
                    <span>Evaluation time: {fdaResult.timestamp}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                  Fill in donor metrics on the left and click "Run FDA Eligibility Check" to see clinical recommendations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI STOCK ANALYTICS & REORDER RECOMMENDATIONS */}
      {activeTab === "ai_recommendations" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                AI Stock Replenishment & Campaign Recommendation Model
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gemini 3.5 engine analyzes current stock levels to generate re-order alerts & targeted donor drives.
              </p>
            </div>

            <button
              onClick={handleRunAiStockRec}
              disabled={loadingAiRecs}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
            >
              {loadingAiRecs ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate AI Stock Insights
            </button>
          </div>

          {aiRecData ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl">
                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm mb-1">
                  AI Inventory Insights: {aiRecData.overallStatus}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {aiRecData.AIInsights}
                </p>
              </div>

              {/* Priority Reorders Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Suggested Donor Campaigns & Reorders:</h4>
                <div className="space-y-2">
                  {aiRecData.reorderPriorities?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-red-600 text-base">{item.bloodGroup}</span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">Reorder {item.recommendedReorder} Units</span>
                          <p className="text-slate-500">{item.campaignAction}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded font-bold">
                        {item.urgency} URGENCY
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
              Click "Generate AI Stock Insights" above to trigger Gemini stock optimization.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DONOR RECORDS MANAGEMENT */}
      {activeTab === "donors" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Registered Blood Donor Database Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View registered donor directory, availability, location, and rating.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search donor name or group..."
                value={searchDonorTerm}
                onChange={(e) => setSearchDonorTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={donor.avatar} alt={donor.name} className="w-12 h-12 rounded-full object-cover border-2 border-red-500" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{donor.name}</h3>
                    <p className="text-xs text-slate-500">{donor.locationName}</p>
                  </div>
                  <span className="ml-auto font-black text-red-600 text-lg">{donor.bloodGroup}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Phone: <strong className="text-slate-800 dark:text-slate-200">{donor.phone}</strong></span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {donor.isAvailable ? "Available" : "Busy"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
