import React, { useState, useRef } from "react";
import { 
  User, Mail, Phone, Heart, Award, ShieldAlert, BadgeInfo, Calendar, Clock,
  Edit2, Check, AlertCircle, Sparkles, Smile, Flame, CheckCircle2, ChevronRight,
  Camera, Image, Globe, Upload, FolderOpen
} from "lucide-react";
import { UserProfile, BloodGroup } from "../types";
import { MOCK_BADGES, MOCK_HISTORY } from "../data";

interface ProfilePageProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSignOut?: () => void;
}

const AVATAR_PRESETS = [
  {
    name: "Classic Operator",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Medical Advocate",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Active Support",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Clinical Director",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Emergency Medic",
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
  }
];

export function ProfilePage({ userProfile, setUserProfile, onSignOut }: ProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>({ ...userProfile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(userProfile.avatar || "");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (e.g., PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Image size should be less than 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUserProfile(prev => ({ ...prev, avatar: result }));
        setProfileForm(prev => ({ ...prev, avatar: result }));
        setTempAvatarUrl(result);
        alert("Profile picture updated from your local device!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectPreset = (url: string) => {
    setUserProfile(prev => ({ ...prev, avatar: url }));
    setProfileForm(prev => ({ ...prev, avatar: url }));
    setTempAvatarUrl(url);
  };

  const handleApplyCustomUrl = () => {
    if (!tempAvatarUrl.trim()) return;
    setUserProfile(prev => ({ ...prev, avatar: tempAvatarUrl }));
    setProfileForm(prev => ({ ...prev, avatar: tempAvatarUrl }));
    alert("Profile picture successfully updated with custom image URL!");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(profileForm);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleAvailability = () => {
    const updatedStatus = !userProfile.isAvailable;
    setUserProfile(prev => ({ ...prev, isAvailable: updatedStatus }));
    setProfileForm(prev => ({ ...prev, isAvailable: updatedStatus }));
    alert(`Volunteer status successfully set to: ${updatedStatus ? "ACTIVE ON-DUTY" : "STANDBY MOUNT"}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: IDENTITY CARD & HEALTH STATUS CARDS */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* HERO CARD & AVATAR BLOCK */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Hidden File Input for Local Image Picker */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md transition-all group-hover:brightness-95"
              />
              <button
                type="button"
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                className="absolute -bottom-1 -right-1 bg-slate-900 hover:bg-slate-800 text-white border-2 border-white rounded-full p-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                title="Edit Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <span className={`absolute bottom-1.5 left-1.5 w-4.5 h-4.5 rounded-full border-2 border-white ${
                userProfile.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`} />
            </div>

            {/* Avatar Selector Panel */}
            {showAvatarSelector && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 mt-2 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">Choose Profile Picture</span>
                  <button 
                    type="button"
                    onClick={() => setShowAvatarSelector(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Close
                  </button>
                </div>

                {/* Primary Action: Select Image File from Device */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-white" />
                  Select Image File from Device
                </button>
                
                {/* Presets Grid */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Or select a preset avatar</span>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(p.url)}
                        className={`relative rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-110 ${
                          userProfile.avatar === p.url ? "border-red-600 scale-105 shadow-xs" : "border-slate-200"
                        }`}
                        title={p.name}
                      >
                        <img src={p.url} alt={p.name} className="w-10 h-10 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Input */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">Or paste custom image URL</span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={tempAvatarUrl}
                      onChange={(e) => setTempAvatarUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-red-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <span className="text-[9px] font-mono font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-0.5 uppercase tracking-wider inline-block">
                Clinical Operator ID
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 font-display">{userProfile.name}</h2>
              <p className="text-xs text-slate-500 font-medium font-mono">{userProfile.email}</p>
            </div>

            {/* QUICK ON-CALL TOGGLE */}
            <div className="w-full p-4 bg-slate-50 border border-slate-250/60 rounded-2xl flex items-center justify-between gap-3 text-left">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Duty On-Oncall Dispatch</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">Visible with en route emergency match inquiries</span>
              </div>
              <button
                type="button"
                onClick={handleToggleAvailability}
                className={`px-4 py-2 rounded-xl text-xs font-black border transition cursor-pointer flex-shrink-0 ${
                  userProfile.isAvailable 
                    ? "bg-emerald-50 border-emerald-250 text-emerald-700 shadow-xs" 
                    : "bg-slate-200 border-slate-300 text-slate-500"
                }`}
              >
                {userProfile.isAvailable ? "ACTIVE ON-DUTY" : "STANDBY"}
              </button>
            </div>

            {/* LIFESAVING STATS PANEL GRID */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
                <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Life Points</span>
                <strong className="text-lg font-black text-slate-900 mt-0.5 block">{userProfile.points} PTS</strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
                <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase tracking-wider block">ABO Rh Genotype</span>
                <strong className="text-lg font-black text-red-600 mt-0.5 block">Type {userProfile.bloodGroup || "O-"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CLINICAL ELIGIBILITY DEFERRAL CRITERIA METRICS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Heart className="w-5 h-5 text-red-650 text-red-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Personal Clinical Parameters</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">FDA whole compliance indicators checklist</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium font-mono uppercase tracking-wide text-[10.5px]">Days Since Donation</span>
              <span className="font-bold text-slate-800">
                {userProfile.lastDonationDays !== null ? `${userProfile.lastDonationDays} days` : "Never"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium font-mono uppercase tracking-wide text-[10.5px]">Candidate Age</span>
              <span className="font-bold text-slate-800">{userProfile.age} Years</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium font-mono uppercase tracking-wide text-[10.5px]">Operating Bodyweight</span>
              <span className="font-bold text-slate-800">{userProfile.weight} Kg</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium font-mono uppercase tracking-wide text-[10.5px]">Screener Status Check</span>
              <span className={`font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                userProfile.age >= 17 && userProfile.weight >= 50 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "bg-red-50 text-red-600"
              }`}>
                {userProfile.age >= 17 && userProfile.weight >= 50 ? "FDA Screen Active" : "Pending Intake Verify"}
              </span>
            </div>

            <div className="p-3 bg-red-50/40 border border-red-150 rounded-2xl flex items-start gap-2.5 text-[11px] leading-relaxed text-red-800">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-medium">
                The FDA compliance protocol requires a strict deferral cycle window of <strong>56 days</strong> between whole blood units.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: MAIN FORM VIEWS BLOCK */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* MASTER DETAILS MANAGEMENT TAB CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-widest block">OPERATOR ATTRIBUTES PLATFORM</span>
              <h3 className="text-sm font-bold text-slate-900 font-display">Manage Profile Details</h3>
            </div>
            {!isEditing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250/20 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit Credentials
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="bg-red-50 hover:bg-red-100 text-red-650 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    Set Offline
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileForm({ ...userProfile });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Operator credentials successfully synchronized with clinical register database.</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2 space-y-1.5 mb-1">
                <label className="block font-bold text-slate-700">Profile Picture / Avatar URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={profileForm.avatar}
                    onChange={(e) => {
                      handleInputChange("avatar", e.target.value);
                      setTempAvatarUrl(e.target.value);
                    }}
                    placeholder="Enter custom image URL..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl border border-slate-250/20 transition cursor-pointer text-[11px] uppercase tracking-wide flex-shrink-0"
                  >
                    {showAvatarSelector ? "Hide Presets" : "Show Presets"}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-slate-700">Full Handle Representative Name</label>
                <input 
                  type="text" 
                  value={profileForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Clinical Register Telephone</label>
                <input 
                  type="text" 
                  value={profileForm.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">On-Call Notifications Email</label>
                <input 
                  type="email" 
                  value={profileForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">ABO Phenotype Antigen</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => handleInputChange("bloodGroup", e.target.value as BloodGroup)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-805 text-slate-800 outline-none focus:bg-white"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Age Range (Yrs)</label>
                  <input 
                    type="number" 
                    value={profileForm.age}
                    onChange={(e) => handleInputChange("age", Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-center"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Bodyweight (Kg)</label>
                  <input 
                    type="number" 
                    value={profileForm.weight}
                    onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-center"
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-2">
                <label className="block mb-1 font-bold text-slate-700">Active Medical Deferral Medications List</label>
                <textarea 
                  value={profileForm.medications}
                  onChange={(e) => handleInputChange("medications", e.target.value)}
                  placeholder="List medications, blood thinners, or write None..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 h-16 outline-none text-xs focus:bg-white focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-bold text-slate-700">Known Clinical Contraindications / Health Issues</label>
                <textarea 
                  value={profileForm.healthIssues}
                  onChange={(e) => handleInputChange("healthIssues", e.target.value)}
                  placeholder="Cardiac anomalies, chronic diabetes, write None if healthy..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 h-16 outline-none text-xs focus:bg-white focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-center uppercase tracking-wider text-[11px] transition-all hover:bg-slate-850"
                >
                  Commit Synchronized Parameters to Register
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-650 text-slate-700 font-semibold">
              <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[9.5px] font-mono text-slate-400 block mb-1">REGISTER HANDLE</span>
                <span className="text-slate-900 font-bold block">{userProfile.name}</span>
              </div>

              <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[9.5px] font-mono text-slate-400 block mb-1">REGISTERED EMAIL</span>
                <span className="text-slate-900 font-mono block truncate">{userProfile.email}</span>
              </div>

              <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[9.5px] font-mono text-slate-400 block mb-1">MESSAGING PHONE</span>
                <span className="text-slate-900 font-mono block">{userProfile.phone}</span>
              </div>

              <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[9.5px] font-mono text-slate-400 block mb-1">PHENOTYPE GENOTYPE</span>
                <span className="text-red-700 font-bold block">Type {userProfile.bloodGroup}</span>
              </div>

              <div className="md:col-span-2 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[9.5px] font-mono text-slate-400 block mb-1">ACTIVE DEFERRAL MEDICATIONS</span>
                <p className="text-slate-805 text-slate-800">
                  {userProfile.medications || "No active medications listed. Ready for clinical extraction."}
                </p>
              </div>

              <div className="md:col-span-2 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[9.5px] font-mono text-slate-400 block mb-1">HEALTH CONTRAINDICATIONS</span>
                <p className="text-slate-805 text-slate-800">
                  {userProfile.healthIssues || "No known history of cardiac or blood pressure contraindications."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* COMPLETED DONATION HISTORIES & UNLOCKED BADGES SUMMARY */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Award className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Unlocking Progression Summary</h3>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-red-50/30 border border-slate-200 rounded-2xl text-center">
                <span className="text-[9px] text-slate-400 font-mono font-bold block">Unlocked</span>
                <span className="text-lg font-black text-rose-700 block">
                  {MOCK_BADGES.filter(b => b.unlocked).length} / {MOCK_BADGES.length} Badges
                </span>
              </div>
              <div className="p-3 bg-red-50/30 border border-slate-200 rounded-2xl text-center">
                <span className="text-[9px] text-slate-400 font-mono font-bold block">Life Salvages</span>
                <span className="text-lg font-black text-emerald-700 block">
                  {MOCK_HISTORY.filter(h => h.status === "Completed").length} Extractions
                </span>
              </div>
              <div className="p-3 bg-red-50/30 border border-slate-200 rounded-2xl text-center">
                <span className="text-[9px] text-slate-400 font-mono font-bold block">Volunteering Unit Dosage</span>
                <span className="text-lg font-black text-blue-700 block">
                  {MOCK_HISTORY.reduce((acc, h) => acc + h.units, 0)} Packed Units
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex justify-between items-center text-slate-600">
              <span className="font-semibold text-slate-700">Digital Honors Signature Certificate:</span>
              <button
                type="button"
                onClick={() => alert(`GENERATE REGIONAL CERTIFICATE: Clinical verification signature signed by Doctor Jenkins. MD-STAMP: #${(userProfile.points + 10931).toString(16).toUpperCase()}`)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3.5 rounded-xl transition cursor-pointer text-[10.5px] uppercase font-bold"
              >
                Download Credentials Badge
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
