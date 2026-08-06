export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Role = "donor" | "patient" | "admin";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  bloodGroup: BloodGroup | "";
  role: Role;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
  avatar: string;
  weight: number;
  age: number;
  lastDonationDays: number | null; // null if never
  medications: string;
  healthIssues: string;
  recentTattoos: boolean;
  points: number;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  latitude: number;
  longitude: number;
  phone: string;
  rating: number;
  isAvailable: boolean;
  avatar: string;
  locationName: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  unitsNeeded: number;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM";
  reason: string;
  status: "Broadcasting" | "Matched" | "EnRoute" | "Arrived" | "Completed" | "Cancelled";
  latitude: number;
  longitude: number;
  donorId?: string;
  createdAt: string;
  contactPhone: string;
}

export interface Message {
  id: string;
  sender: "patient" | "donor";
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  tag: string;
}

export interface RewardBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  dateUnlocked?: string;
  requirement: string;
  progress: number; // 0-100
}

export interface DonationRecord {
  id: string;
  date: string;
  hospitalName: string;
  units: number;
  bloodGroup: BloodGroup;
  status: "Completed" | "Deferred";
  certificateId: string;
}

export type ScreenId =
  | "splash"
  | "onboarding"
  | "role_selection"
  | "login"
  | "otp"
  | "registration"
  | "blood_selection"
  | "location_access"
  | "profile_creator"
  | "eligibility_checker"
  | "home"
  | "request_form"
  | "radar_search"
  | "ai_matching"
  | "map_tracking"
  | "request_notification"
  | "accept_reject"
  | "live_route"
  | "hospital_details"
  | "offline_sms"
  | "chat_calling"
  | "donation_history"
  | "reward_badges"
  | "certificate"
  | "status_tracking"
  | "community_feed"
  | "notifications"
  | "profile_manager"
  | "settings"
  | "help_support"
  | "admin_dashboard";
