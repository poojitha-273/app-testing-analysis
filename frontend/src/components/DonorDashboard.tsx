import React, { useState } from "react";
import { 
  User, Award, Bell, ShieldCheck, Calendar, Navigation, Heart, CheckCircle2, 
  MapPin, Phone, Upload, Sparkles, AlertTriangle, ArrowRight, Zap, Download, RefreshCw, Clock
} from "lucide-react";
import { BloodRequest, UserProfile, RewardBadge, DonationRecord } from "../types";

interface DonorDashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  requestsList: BloodRequest[];
  onAcceptRequest: (request: BloodRequest) => void;
  badges: RewardBadge[];
  history: DonationRecord[];
  onNavigateToHospital: (hospitalName: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  userProfile,
  onUpdateProfile,
  requestsList,
  onAcceptRequest,
  badges,
  history,
  onNavigateToHospital
}) => {
  const [activeTab, setActiveTab] = useState<"alerts" | "profile" | "verification" | "history" | "rewards" | "navigation">("alerts");

  // Document Upload State
  const [docType, setDocType] = useState("Government Driver License");
  const [docNumber, setDocNumber] = useState("DL-88902-CA");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Calculate days remaining for next eligible donation (56 days rule)
  const lastDonationDays = userProfile.lastDonationDays || 120;
  const daysUntilEligible = Math.max(0, 56 - lastDonationDays);
  const isEligibleNow = daysUntilEligible === 0;

  const handleToggleAvailability = () => {
    onUpdateProfile((prev) => ({
      ...prev,
      isAvailable: !prev.isAvailable
    }));
  };

  const handleUploadVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingDoc(true);
    try {
      const userId = "default_user";
      const res = await fetch(`/api/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: docType, documentNumber: docNumber })
      });
      const data = await res.json();
      setVerificationResult(data);
      if (data.user) {
        onUpdateProfile(data.user);
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const activeSosRequests = requestsList.filter(r => r.status === "Broadcasting");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-900 text-white rounded-2xl p-6 shadow-xl border border-red-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
            alt={userProfile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-red-700">
                Type {userProfile.bloodGroup || "O-"}
              </span>
            </div>
            <p className="text-red-100 text-xs mt-1">
              Civic Hero Donor | <span className="font-bold">{userProfile.points} Civic Honor Points</span>
            </p>
          </div>
        </div>

        {/* Availability Toggle & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md ${
              userProfile.isAvailable 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${userProfile.isAvailable ? "bg-white animate-ping" : "bg-slate-500"}`} />
            {userProfile.isAvailable ? "ON DUTY (Receiving Alerts)" : "OFF DUTY (Paused)"}
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "alerts" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          Emergency Alerts ({activeSosRequests.length})
        </button>

        <button
          onClick={() => setActiveTab("verification")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "verification" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Identity Proof Verification
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "history" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Donation History & Reminders
        </button>

        <button
          onClick={() => setActiveTab("rewards")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "rewards" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          Rewards & Badges
        </button>

        <button
          onClick={() => setActiveTab("navigation")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "navigation" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Navigation className="w-4 h-4" />
          Hospital Navigation
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "profile" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          Donor Profile Settings
        </button>
      </div>

      {/* TAB 1: EMERGENCY SOS BROADCAST ALERTS */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                  Community Emergency Blood Response Network
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time emergency broadcast alerts nearby. Respond immediately to save lives.
                </p>
              </div>

              <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full text-xs font-extrabold">
                {activeSosRequests.length} Live SOS Active
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {activeSosRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No active emergency broadcasts at this moment. Stay on standby!
                </div>
              ) : (
                activeSosRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-gradient-to-br from-red-50/50 to-rose-50/20 dark:from-red-950/20 dark:to-slate-900 space-y-3 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                          {req.bloodGroup}
                        </span>
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                            Patient: {req.patientName} ({req.unitsNeeded} Units Required)
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            {req.hospitalName}
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-extrabold uppercase animate-pulse self-start sm:self-center">
                        {req.urgency} EMERGENCY
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                      "{req.reason}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {req.contactPhone}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onAcceptRequest(req);
                            setActiveTab("navigation");
                          }}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                        >
                          <Zap className="w-4 h-4 text-amber-300" />
                          Accept Emergency Request & Start Route
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IDENTITY PROOF VERIFICATION */}
      {activeTab === "verification" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Upload Identity Proof for Donor Verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified donors gain priority dispatch badges and earn +100 Civic Honor Points.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleUploadVerification} className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Identity Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                >
                  <option value="Government Driver License">Government Driver's License</option>
                  <option value="National Identity Card">National ID Card / Passport</option>
                  <option value="Official Blood Donor Registration Card">Official Donor Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Serial Number</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-red-400 transition-all cursor-pointer bg-white dark:bg-slate-900">
                <Upload className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 dark:text-slate-200">Drag & Drop Document Image or Click to Browse</p>
                <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, PDF (Max 10MB)</p>
              </div>

              <button
                type="submit"
                disabled={uploadingDoc}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {uploadingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Submit for Instant AI Verification
              </button>
            </form>

            <div>
              {verificationResult ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-200 text-lg">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    Identity Verified Successfully!
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Your {verificationResult.documentType} has been validated. You earned <strong>+{verificationResult.pointsBonus} Civic Honor Points</strong>!
                  </p>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Badge Unlocked: {verificationResult.badgeEarned}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                  Submit your identity document on the left to earn the "Verified Donor" badge and bonus points.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DONATION HISTORY & NEXT ELIGIBLE DONATION REMINDER */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Eligibility Reminder Card */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isEligibleNow 
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" 
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
          }`}>
            <div>
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <Clock className="w-5 h-5 text-amber-500" />
                Next Eligible Donation Countdown (56-Day FDA Rule)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {isEligibleNow
                  ? "You are fully eligible to donate whole blood today!"
                  : `You must wait ${daysUntilEligible} more days before your next whole blood donation.`}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {isEligibleNow ? "ELIGIBLE NOW" : `${daysUntilEligible} Days Left`}
              </span>
            </div>
          </div>

          {/* Past Donations Table */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Donation History Log</h3>
            <div className="space-y-3">
              {history.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rec.hospitalName}</h4>
                    <p className="text-xs text-slate-500">{rec.date} | {rec.units} Unit ({rec.bloodGroup})</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-xs font-bold">
                      {rec.status}
                    </span>
                    <button
                      onClick={() => alert(`Downloading Certificate ID: ${rec.certificateId}`)}
                      className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REWARDS & BADGES */}
      {activeTab === "rewards" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Civic Honor Rewards & Achievement Badges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Earn honor badges and civic recognition by completing emergency donations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className={`p-4 rounded-xl border space-y-2 ${
                badge.unlocked 
                  ? "bg-amber-50/40 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800" 
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75"
              }`}>
                <div className="flex justify-between items-center">
                  <Award className={`w-8 h-8 ${badge.unlocked ? "text-amber-500" : "text-slate-400"}`} />
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.unlocked ? "bg-amber-500 text-white" : "bg-slate-300 text-slate-700"}`}>
                    {badge.unlocked ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{badge.title}</h4>
                <p className="text-xs text-slate-500">{badge.description}</p>

                <div className="pt-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${badge.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HOSPITAL NAVIGATION */}
      {activeTab === "navigation" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-red-600" />
              Turn-by-Turn Hospital Emergency Navigation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive Google Maps route optimization guiding you to the emergency hospital entrance.
            </p>
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-red-400 font-bold uppercase">Active Emergency Route</span>
                <h3 className="text-xl font-extrabold">California Pacific Medical Center (CPMC)</h3>
                <p className="text-xs text-slate-300">1101 Van Ness Ave, San Francisco, CA 94109</p>
              </div>

              <a
                href="tel:+14156006000"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call Dispatch Desk
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center bg-slate-800/80 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Distance</span>
                <span className="font-extrabold text-white text-base">1.4 Miles</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Time</span>
                <span className="font-extrabold text-emerald-400 text-base">6 Mins</span>
              </div>
              <div>
                <span className="text-slate-400 block">Traffic</span>
                <span className="font-extrabold text-amber-400 text-base">Light Traffic</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToHospital("California Pacific Medical Center")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <Navigation className="w-4 h-4" />
              Launch Live Turn-by-Turn GPS Map Tracker
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: DONOR PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Donor Profile & Health Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => onUpdateProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={userProfile.phone}
                onChange={(e) => onUpdateProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={userProfile.weight}
                onChange={(e) => onUpdateProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={userProfile.age}
                onChange={(e) => onUpdateProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
