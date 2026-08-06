import React, { useState } from "react";
import { Check, AlertTriangle, HelpCircle, Loader2, Heart, RefreshCw } from "lucide-react";

interface EligibilityCheckerProps {
  onCheckingComplete?: (isEligible: boolean) => void;
}

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({ onCheckingComplete }) => {
  const [age, setAge] = useState<number>(26);
  const [weight, setWeight] = useState<number>(68);
  const [lastDonationDays, setLastDonationDays] = useState<number | null>(120); // null means never
  const [recentTattoos, setRecentTattoos] = useState<boolean>(false);
  const [medications, setMedications] = useState<string>("");
  const [healthIssues, setHealthIssues] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    isEligible: boolean;
    statusSummary: string;
    deferredDays: number;
    recommendations: string[];
  } | null>(null);

  const performCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/check-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          weight,
          lastDonationDays,
          recentTattoos,
          medications,
          healthIssues
        })
      });
      const data = await response.json();
      setAiReport(data);
      if (onCheckingComplete) {
        onCheckingComplete(data.isEligible);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setAiReport({
        isEligible: age >= 17 && age <= 65 && weight >= 50 && !recentTattoos,
        statusSummary: "Failed to connect to AI Server. Standard clinical metrics calculated locally.",
        deferredDays: recentTattoos ? 90 : 0,
        recommendations: ["Ensure your food consumption stands high prior to donating.", "Drink excess electrolyte fluids."]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAiReport(null);
    setMedications("");
    setHealthIssues("");
    setRecentTattoos(false);
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-red-650 fill-current text-red-600" />
        <h3 className="text-sm font-bold text-slate-900 font-display">AI Compatibility & Eligibility Tester</h3>
      </div>

      {!aiReport ? (
        <div className="space-y-4">
          {/* Age slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-slate-500">
              <label>Age: <strong className="text-slate-900 font-bold">{age}</strong> yrs</label>
              <span className="font-mono text-[10px]">16 - 80</span>
            </div>
            <input 
              type="range" 
              min="16" 
              max="80" 
              value={age} 
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-red-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Weight slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-slate-500">
              <label>Weight (kg): <strong className="text-slate-900 font-bold">{weight}</strong> kg</label>
              <span className="font-mono text-[10px]">40 - 150</span>
            </div>
            <input 
              type="range" 
              min="40" 
              max="150" 
              value={weight} 
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-red-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Separation interval */}
          <div>
            <label className="block text-xs mb-1.5 text-slate-500">Last Donation Interval</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => setLastDonationDays(null)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition ${lastDonationDays === null ? 'bg-red-50 border-red-600 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Never
              </button>
              <button 
                type="button"
                onClick={() => setLastDonationDays(45)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition ${lastDonationDays === 45 ? 'bg-red-50 border-red-600 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                45 Days
              </button>
              <button 
                type="button"
                onClick={() => setLastDonationDays(120)}
                className={`py-1.5 text-xs rounded-lg border font-medium transition ${lastDonationDays === 120 ? 'bg-red-50 border-red-600 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                120 Days
              </button>
            </div>
          </div>

          {/* Medication query input */}
          <div>
            <label className="block text-xs mb-1.5 text-slate-500">Medications (aspirin, penicillin...)</label>
            <input 
              type="text" 
              placeholder="e.g., none or aspirin" 
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
            />
          </div>

          {/* Allergy warnings toggle */}
          <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 my-1">
            <span className="text-xs text-slate-500">Tattoo/Piercing (Last 3 months?)</span>
            <input 
              type="checkbox" 
              checked={recentTattoos}
              onChange={(e) => setRecentTattoos(e.target.checked)}
              className="accent-red-600 w-4 h-4 cursor-pointer"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={performCheck}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Querying Clinical Guidelines...
              </>
            ) : (
              "Check Compatibility Eligibility"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-start gap-3 border ${
            aiReport.isEligible 
              ? 'bg-green-50 border-green-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            {aiReport.isEligible ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-xs font-bold leading-none ${aiReport.isEligible ? 'text-green-800' : 'text-amber-800'}`}>
                {aiReport.isEligible ? "ELIGIBILITY VERIFIED" : "TEMPORARILY DEFERRED"}
              </p>
              <p className="text-[11.5px] text-slate-700 mt-2 leading-relaxed">
                {aiReport.statusSummary}
              </p>
              {aiReport.deferredDays > 0 && (
                <p className="text-[10px] text-amber-850 font-bold mt-1.5 uppercase font-mono tracking-wider">
                  Wait interval: {aiReport.deferredDays} days remaining
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Clinical Advice:</span>
            <div className="space-y-1">
              {aiReport.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11.5px] text-slate-650">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="text-slate-600">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition mt-2 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Restart Assessment
          </button>
        </div>
      )}
    </div>
  );
};
