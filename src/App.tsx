/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLOOD AI – EMERGENCY AI CLINICAL COMMAND CENTER
 * 3-Tier Multi-Dashboard System:
 * 1. Hospital Management Dashboard
 * 2. Blood Bank Dashboard
 * 3. Donor / Public Dashboard
 */

import React, { useState, useEffect } from "react";
import { 
  Heart, MapPin, MessageSquare, Phone, ShieldAlert, Globe, Award, Zap, Search, 
  Bell, Settings, HelpCircle, LogOut, CheckCircle2, XCircle, Plus, Send, 
  Navigation, User, Map, Calendar, Sparkles, Wifi, WifiOff, AlertTriangle, Battery, Signal,
  FileText, Check, Share2, Clock, Compass, Sliders, PlusCircle, Lock, BookOpen, 
  Users, LayoutDashboard, ChevronRight, Activity, MessageCircle, Volume2, VolumeX, 
  Menu, Info, Building2, Database, HeartHandshake
} from "lucide-react";

// Imports from modular component files
import { InteractiveMap } from "./components/InteractiveMap";
import { EligibilityChecker } from "./components/EligibilityChecker";
import { AIMatchingPanel } from "./components/AIMatchingPanel";
import { ProfilePage } from "./components/ProfilePage";
import { AuthPage } from "./components/AuthPage";
import { HospitalDashboard } from "./components/HospitalDashboard";
import { BloodBankDashboard } from "./components/BloodBankDashboard";
import { DonorDashboard } from "./components/DonorDashboard";
import { WorkflowStepper } from "./components/WorkflowStepper";
import { BottomNavigation } from "./components/BottomNavigation";

import { MOCK_DONORS, MOCK_REQUESTS, HOSPITALS, FAQS, MOCK_BADGES, MOCK_HISTORY, MOCK_POSTS } from "./data";
import { BloodGroup, BloodRequest, Message, UserProfile, CommunityPost } from "./types";
import { supabase } from "./supabaseClient";

export default function App() {
  // --- STATE STORES ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"hospital" | "blood_bank" | "donor" | "map" | "antigens" | "community" | "profile">("hospital");
  const [networkOnline, setNetworkOnline] = useState<boolean>(true);
  const [simulatedGPSMove, setSimulatedGPSMove] = useState<boolean>(false);
  const [activeSOS, setActiveSOS] = useState<boolean>(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  // Clinical data stores
  const [donorsList] = useState(MOCK_DONORS);
  const [requestsList, setRequestsList] = useState<BloodRequest[]>(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest>(MOCK_REQUESTS[0]);
  const [postsList, setPostsList] = useState<CommunityPost[]>(MOCK_POSTS);

  // Active User profile local state
  const [userProfile, setUserProfileState] = useState<UserProfile>({
    name: "Alex Mercer",
    phone: "+1 (555) 304-2019",
    email: "alex.mercer@gmail.com",
    bloodGroup: "O-",
    role: "donor",
    latitude: 37.7749,
    longitude: -122.4194,
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    weight: 72,
    age: 28,
    lastDonationDays: 120,
    medications: "",
    healthIssues: "",
    recentTattoos: false,
    points: 350
  });

  const setUserProfile = (
    updater: UserProfile | ((prev: UserProfile) => UserProfile)
  ) => {
    setUserProfileState((prev) => {
      const nextProfile = typeof updater === "function" ? updater(prev) : updater;
      const userId = currentUser?.uid || "demo_user_1";
      fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...nextProfile })
      }).catch((err) => console.error("Failed to update profile:", err));
      return nextProfile;
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signout error:", err);
    }
    localStorage.removeItem("blood_ai_user");
    setCurrentUser(null);
    setShowProfileDropdown(false);
    window.history.pushState({}, "", "/login");
  };

  // Protect private pages with Supabase auth session check & real-time state listener
  useEffect(() => {
    setAuthLoading(true);

    const handleSession = (session: any) => {
      if (session && session.user) {
        const userObj = {
          uid: session.user.id,
          email: session.user.email || "",
          displayName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Operator",
        };
        setCurrentUser(userObj);
        localStorage.setItem("blood_ai_user", JSON.stringify(userObj));

        // Sync profile details if exists
        fetch(`/api/users/${userObj.uid}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.name) {
              setUserProfileState(data);
            }
          })
          .catch((err) => console.error("Failed to sync profile:", err));

        // If logged in and on /login page, redirect to home ("/")
        if (window.location.pathname === "/login") {
          window.history.replaceState({}, "", "/");
        }
      } else {
        // No session: Protect private pages and redirect to /login
        setCurrentUser(null);
        localStorage.removeItem("blood_ai_user");
        if (window.location.pathname !== "/login") {
          window.history.replaceState({}, "", "/login");
        }
      }
      setAuthLoading(false);
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error retrieving Supabase session:", error);
      }
      handleSession(session);
    });

    // 2. Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Periodic clinical requests background sync
  useEffect(() => {
    if (!currentUser) return;

    let requestsInterval: NodeJS.Timeout | null = null;

    const syncRequests = async () => {
      try {
        const res = await fetch("/api/requests");
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRequestsList(list);
            setSelectedRequest((curr) => {
              if (!curr) return list[0];
              const stillExists = list.find((r: any) => r.id === curr.id);
              return stillExists || list[0];
            });
          }
        }
      } catch (err) {
        console.warn("Requests sync paused, using cached data:", err);
      }
    };

    syncRequests();
    requestsInterval = setInterval(syncRequests, 4000);

    return () => {
      if (requestsInterval) clearInterval(requestsInterval);
    };
  }, [currentUser]);

  // Request Handlers
  const handleCreateRequest = async (reqData: Partial<BloodRequest>) => {
    const newReq: BloodRequest = {
      id: `req_${Date.now()}`,
      patientName: reqData.patientName || "Emergency Patient",
      bloodGroup: reqData.bloodGroup || "O-",
      hospitalName: reqData.hospitalName || "California Pacific Medical Center",
      unitsNeeded: reqData.unitsNeeded || 2,
      urgency: reqData.urgency || "CRITICAL",
      reason: reqData.reason || "Emergency trauma blood loss.",
      status: reqData.status || "Broadcasting",
      latitude: reqData.latitude || 37.7760,
      longitude: reqData.longitude || -122.4140,
      createdAt: reqData.createdAt || new Date().toISOString(),
      contactPhone: reqData.contactPhone || "+1 (555) 911-0000"
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReq)
      });
      if (res.ok) {
        setSelectedRequest(newReq);
        setActiveSOS(true);
        const listRes = await fetch("/api/requests");
        if (listRes.ok) {
          const list = await listRes.json();
          setRequestsList(list);
        }
        alert(`Emergency Request Created! Broadcasting ${newReq.unitsNeeded} units of ${newReq.bloodGroup} at ${newReq.hospitalName}.`);
      }
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: BloodRequest["status"], donorId?: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, donorId })
      });
      if (res.ok) {
        const listRes = await fetch("/api/requests");
        if (listRes.ok) {
          const list = await listRes.json();
          setRequestsList(list);
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleAllocateStockToRequest = (requestId: string, units: number) => {
    handleUpdateRequestStatus(requestId, "Matched");
  };

  const handleAcceptRequestByDonor = (req: BloodRequest) => {
    setSelectedRequest(req);
    handleUpdateRequestStatus(req.id, "EnRoute", "donor_self");
    setSimulatedGPSMove(true);
    setActiveTab("map");
    alert(`Emergency Accepted! Turn-by-turn navigation launched for ${req.hospitalName}.`);
  };

  const handleGPSProgressEnd = async () => {
    setSimulatedGPSMove(false);
    if (selectedRequest?.id) {
      await handleUpdateRequestStatus(selectedRequest.id, "Arrived");
    }
    alert("ARRIVAL CONFIRMED: Courier / Donor has arrived at the hospital emergency room!");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-slate-900 select-none">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl shadow-lg border border-red-500 animate-pulse">
            <Heart className="w-9 h-9 fill-current text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900">Blood AI</h1>
            <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Emergency Clinical Hub</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <AuthPage onAuthSuccess={(user) => setCurrentUser(user)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-500 selection:text-white">
      {/* Top Application Header Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-rose-700 p-2.5 rounded-2xl shadow-lg shadow-red-600/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Blood AI</span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700">
                  CLINICAL COMMAND HUB
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Interconnected Emergency Blood System: Hospital • Blood Bank • Public Donors
              </p>
            </div>
          </div>

          {/* Top Right Controls & Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNetworkOnline(!networkOnline)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                networkOnline 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {networkOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {networkOnline ? "BROADBAND ONLINE" : "OFFLINE SMS BACKUP"}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 p-1.5 rounded-xl transition"
              >
                <img src={userProfile.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-red-500" />
                <span className="text-xs font-bold text-slate-800 hidden md:block">{userProfile.name}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showProfileDropdown ? "rotate-90" : ""}`} />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-12 w-72 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-500">Operator Profile</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700">
                      Type {userProfile.bloodGroup || "O-"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{userProfile.name}</p>
                    <p className="text-slate-500">{userProfile.email}</p>
                    <p className="text-emerald-600 font-semibold mt-1">{userProfile.points} Civic Honor Points</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold py-2 rounded-xl text-center transition flex items-center justify-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    View Profile Details
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-center transition"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-24 space-y-6">
        {/* Interactive Step-by-Step Workflow Stepper */}
        <WorkflowStepper
          activeStep={
            activeTab === "hospital" ? "hospital" :
            activeTab === "blood_bank" ? "blood_bank" :
            "donor"
          }
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Primary Dashboard Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 text-xs font-bold shadow-xs">
          <button
            onClick={() => setActiveTab("hospital")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "hospital" 
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === "hospital" ? "text-white" : "text-red-500"}`} />
            1. Hospital Management Dashboard
          </button>

          <button
            onClick={() => setActiveTab("blood_bank")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "blood_bank" 
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === "blood_bank" ? "text-white" : "text-red-500"}`} />
            2. Blood Bank Dashboard
          </button>

          <button
            onClick={() => setActiveTab("donor")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "donor" 
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <HeartHandshake className={`w-4 h-4 ${activeTab === "donor" ? "text-white" : "text-red-500"}`} />
            3. Donor / Public Dashboard
          </button>

          <div className="h-5 w-px bg-slate-300 mx-1 hidden lg:block" />

          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "map" 
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <Navigation className={`w-4 h-4 ${activeTab === "map" ? "text-white" : "text-red-500"}`} />
            GPS Blood Tracking Map
          </button>

          <button
            onClick={() => setActiveTab("antigens")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "antigens" 
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === "antigens" ? "text-white" : "text-amber-500"}`} />
            AI Compatibility Analysis
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "profile" 
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === "profile" ? "text-white" : "text-emerald-600"}`} />
            Profile Details
          </button>
        </div>

        {/* TAB 1: HOSPITAL MANAGEMENT DASHBOARD */}
        {activeTab === "hospital" && (
          <HospitalDashboard
            requestsList={requestsList}
            onCreateRequest={handleCreateRequest}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            donorsList={donorsList}
            onSelectRequestForTracking={(req) => {
              setSelectedRequest(req);
              setSimulatedGPSMove(true);
              setActiveTab("map");
            }}
          />
        )}

        {/* TAB 2: BLOOD BANK DASHBOARD */}
        {activeTab === "blood_bank" && (
          <BloodBankDashboard
            requestsList={requestsList}
            onAllocateStockToRequest={handleAllocateStockToRequest}
            donorsList={donorsList}
          />
        )}

        {/* TAB 3: DONOR / PUBLIC DASHBOARD */}
        {activeTab === "donor" && (
          <DonorDashboard
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            requestsList={requestsList}
            onAcceptRequest={handleAcceptRequestByDonor}
            badges={MOCK_BADGES}
            history={MOCK_HISTORY}
            onNavigateToHospital={() => setActiveTab("map")}
          />
        )}

        {/* TAB 4: GPS TELEMETRY & ROUTE MAP */}
        {activeTab === "map" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-red-500" />
                  Live GPS Blood Delivery Tracking Station
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time telemetry showing courier / donor vehicle moving towards hospital emergency entrance.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-mono font-bold">
                LAT {userProfile.latitude?.toFixed(4) || "37.7760"} | LNG {userProfile.longitude?.toFixed(4) || "-122.4140"}
              </span>
            </div>

            <InteractiveMap
              donorLat={userProfile.latitude}
              donorLng={userProfile.longitude}
              isSimulatingMove={simulatedGPSMove}
              onProgressComplete={handleGPSProgressEnd}
              hospitalName={selectedRequest?.hospitalName || "California Pacific Medical Center"}
              onLocationClick={(lat, lng) => {
                setUserProfile((prev) => ({ ...prev, latitude: lat, longitude: lng }));
              }}
            />
          </div>
        )}

        {/* TAB 5: AI COMPATIBILITY ANALYSIS */}
        {activeTab === "antigens" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Gemini AI Antigen & ABO Blood Compatibility Engine
              </h2>
              <p className="text-xs text-slate-500">
                Perform rapid clinical cross-matching analysis for emergency transfusions.
              </p>
            </div>

            <AIMatchingPanel
              patientGroup={selectedRequest?.bloodGroup || "O-"}
              donorGroup={userProfile.bloodGroup || "O-"}
              distanceKm={2.4}
              urgency={selectedRequest?.urgency || "CRITICAL"}
              clinicalNotes={selectedRequest?.reason}
            />
          </div>
        )}

        {/* TAB 6: PROFILE DETAILS SCREEN */}
        {activeTab === "profile" && (
          <ProfilePage
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Mobile & App Native Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isSimulatingMove={simulatedGPSMove}
        activeRequestsCount={requestsList.filter((r) => r.status === "Broadcasting").length}
      />
    </div>
  );
}
