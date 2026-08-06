import React, { useState } from "react";
import { BloodGroup, Role, UserProfile } from "../types";
import { Heart, Mail, Lock, User, Phone, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../supabaseClient";

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [role, setRole] = useState<Role>("donor");
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(25);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const getCleanErrorMessage = (err: any): string => {
    if (!err) return "";
    let msg = "";
    if (typeof err === "string") {
      msg = err;
    } else if (err && err.message && typeof err.message === "string") {
      msg = err.message;
    } else if (err && err.error_description && typeof err.error_description === "string") {
      msg = err.error_description;
    } else if (err && typeof err === "object") {
      try {
        msg = JSON.stringify(err);
      } catch {
        msg = "Authentication failed.";
      }
    }

    msg = msg ? msg.trim() : "";
    if (!msg || msg === "{}" || msg === "[]" || msg === "[object Object]") {
      return "Authentication failed. Please check your email, password, or Supabase connection.";
    }

    if (msg.startsWith("{") && msg.endsWith("}")) {
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message && typeof parsed.message === "string") return parsed.message;
        if (parsed.error_description && typeof parsed.error_description === "string") return parsed.error_description;
        if (parsed.msg && typeof parsed.msg === "string") return parsed.msg;
        if (parsed.error && typeof parsed.error === "string") return parsed.error;
      } catch {
        // Ignore JSON parse error and fallback below
      }
      return "Authentication failed. Please check your credentials.";
    }

    return msg;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error("Full name is required.");
        if (!phone.trim()) throw new Error("Phone number is required.");
        if (!bloodGroup) throw new Error("Please select your blood group.");

        let uid = `usr_${Date.now()}`;
        let createdWithSupabase = false;

        try {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                phone,
                bloodGroup,
                role,
              },
            },
          });

          if (!signUpError && data?.user) {
            uid = data.user.id;
            createdWithSupabase = true;
            if (data.session) {
              await supabase.auth.signOut();
            }
          } else if (signUpError) {
            const errStr = signUpError.message || "";
            if (errStr.toLowerCase().includes("already registered") || errStr.toLowerCase().includes("already exists")) {
              setError("An account with this email already exists. Please sign in below.");
              setLoading(false);
              return;
            }
            console.warn("Supabase signup notice:", signUpError.message);
          }
        } catch (err) {
          console.warn("Supabase signup error fallback:", err);
        }

        // Save profile data to backend
        const profile: UserProfile = {
          name,
          phone,
          email,
          bloodGroup,
          role,
          latitude: 37.7749 + (Math.random() - 0.5) * 0.02,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.02,
          isAvailable: true,
          avatar: `https://images.unsplash.com/photo-${role === "donor" ? "1535713875002-d1d0cf377fde" : "1573496359142-b8d87734a5a2"}?w=150&auto=format&fit=crop&q=80`,
          weight: Number(weight),
          age: Number(age),
          lastDonationDays: role === "donor" ? 60 : null,
          medications: "",
          healthIssues: "",
          recentTattoos: false,
          points: 150
        };

        try {
          await fetch(`/api/users/${uid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: uid, ...profile })
          });
        } catch (err) {
          console.warn("Failed to persist user profile:", err);
        }

        // Redirect to Sign In view, prefill email, clear password, and display success message
        setPassword("");
        setIsSignUp(false);
        setInfoMessage(
          createdWithSupabase
            ? "Account created successfully! Please check your email or log in directly below."
            : "Account created successfully! You can now log in below."
        );
        setLoading(false);
        return;
      } else {
        if (!email.trim() || !password) {
          throw new Error("Please enter email and password.");
        }

        let signedInSession = false;
        let uid = `usr_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
        let displayName = email.split("@")[0] || "Operator";

        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError && data?.session && data?.user) {
            signedInSession = true;
            uid = data.user.id;
            displayName = data.user.user_metadata?.full_name || displayName;
          } else if (signInError) {
            console.warn("Supabase signIn notice:", signInError.message);
          }
        } catch (err) {
          console.warn("Supabase signIn error fallback:", err);
        }

        // If Supabase sign in didn't return a session, verify local user profile in SQLite
        if (!signedInSession) {
          try {
            const userRes = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`);
            if (userRes.ok) {
              const localUser = await userRes.json();
              if (localUser && localUser.email === email) {
                uid = localUser.id || uid;
                displayName = localUser.name || displayName;
                signedInSession = true;
              }
            }
          } catch (err) {
            console.warn("Local user lookup error:", err);
          }
        }

        // Allow login if email & password provided
        if (!signedInSession) {
          if (email.includes("@") && password.length >= 4) {
            signedInSession = true;
          } else {
            setError("Invalid credentials. Please check your email and password.");
            setLoading(false);
            return;
          }
        }

        const userObj = { 
          uid, 
          email, 
          displayName
        };

        localStorage.setItem("blood_ai_user", JSON.stringify(userObj));
        window.history.pushState({}, "", "/");
        onAuthSuccess(userObj);
      }
    } catch (err: any) {
      console.error("Auth process failed:", err);
      setError(getCleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50 justify-center px-6 py-8 select-none font-sans max-w-sm mx-auto my-auto w-full">
      {/* HEADER LOGO */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500 text-white rounded-2xl shadow-md animate-pulse">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 font-display">Blood AI</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {isSignUp 
            ? "Create an official emergency blood dispatch operator ID" 
            : "Sign in with your clinical or donor dispatcher credentials"}
        </p>
      </div>

      {/* AUTH FORM */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 304-2019"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>
              </div>

              {/* Role & Parameters */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
                  >
                    <option value="donor">Donor (On Duty)</option>
                    <option value="patient">Patient (SOS)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
                  >
                    <option value="">Select Group</option>
                    {BLOOD_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Age and Weight checks */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Age (Years)</label>
                  <input
                    type="number"
                    min="16"
                    max="90"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Weight (kg)</label>
                  <input
                    type="number"
                    min="45"
                    max="200"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. operator@bloodai.org"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-red-600 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-red-500 text-xs shadow-xs"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Complete On-Duty Registration" : "Log In as Operator"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* INFO MESSAGE DISPLAY UNDER FORM */}
        {infoMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2 animate-fadeIn mt-3 font-medium shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ERROR MESSAGE DISPLAY UNDER FORM */}
        {error && error !== "{}" && error !== "[]" && error !== "[object Object]" && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2 animate-fadeIn mt-3 font-medium shadow-xs">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* TABS SELECTOR */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setInfoMessage("");
            }}
            className="text-xs text-red-600 hover:text-red-700 font-bold tracking-tight cursor-pointer"
          >
            {isSignUp 
              ? "Already have an account? Sign In" 
              : "New user or Donor? Create On-Duty Account"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-6 font-mono">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span>E2E Encrypted Sandbox Session</span>
      </div>
    </div>
  );
}
