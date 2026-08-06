import React from "react";
import { ArrowRight, Building2, Database, HeartHandshake, CheckCircle2 } from "lucide-react";

interface WorkflowStepperProps {
  activeStep: "hospital" | "blood_bank" | "donor";
  onSelectTab: (tab: "hospital" | "blood_bank" | "donor") => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ activeStep, onSelectTab }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Integrated Emergency Workflow Pipeline:
        </h3>
        <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
          Seamless 3-Dashboard Sync
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Hospital */}
        <button
          onClick={() => onSelectTab("hospital")}
          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
            activeStep === "hospital"
              ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-red-500"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                Hospital Management
              </h4>
              <p className="text-[10px] text-slate-500">Creates request & AI predicts demand</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Step 2: Blood Bank */}
        <button
          onClick={() => onSelectTab("blood_bank")}
          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
            activeStep === "blood_bank"
              ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-red-500"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-red-600" />
                Blood Bank Dashboard
              </h4>
              <p className="text-[10px] text-slate-500">Allocates stock or triggers SOS alert</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Step 3: Donor / Public */}
        <button
          onClick={() => onSelectTab("donor")}
          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
            activeStep === "donor"
              ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-red-500"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-red-600" />
                Donor / Public Dashboard
              </h4>
              <p className="text-[10px] text-slate-500">Accepts alert & GPS navigates to hospital</p>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </button>
      </div>
    </div>
  );
};
