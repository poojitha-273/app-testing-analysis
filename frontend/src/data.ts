import { Donor, BloodRequest, CommunityPost, RewardBadge, DonationRecord } from "./types";

export const MOCK_DONORS: Donor[] = [
  {
    id: "donor_1",
    name: "Dr. Sarah Jenkins",
    bloodGroup: "O-",
    distanceKm: 1.4,
    latitude: 37.7780,
    longitude: -122.4120,
    phone: "+1 (555) 304-2019",
    rating: 4.9,
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80",
    locationName: "Sutter Health Specialty Care Center"
  },
  {
    id: "donor_2",
    name: "Marcus Aurelius",
    bloodGroup: "O-",
    distanceKm: 2.8,
    latitude: 37.7850,
    longitude: -122.4010,
    phone: "+1 (555) 791-3048",
    rating: 4.8,
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    locationName: "UCSF Health Medical Center"
  },
  {
    id: "donor_3",
    name: "Emily Watson",
    bloodGroup: "A+",
    distanceKm: 0.8,
    latitude: 37.7730,
    longitude: -122.4180,
    phone: "+1 (555) 289-4051",
    rating: 4.7,
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    locationName: "Mission District Urgent Care"
  },
  {
    id: "donor_4",
    name: "Arjun Mehta",
    bloodGroup: "B+",
    distanceKm: 3.2,
    latitude: 37.7600,
    longitude: -122.4200,
    phone: "+1 (555) 890-4411",
    rating: 4.9,
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    locationName: "Kaiser Permanente Center"
  },
  {
    id: "donor_5",
    name: "Carlos Santana",
    bloodGroup: "AB+",
    distanceKm: 4.1,
    latitude: 37.7910,
    longitude: -122.3950,
    phone: "+1 (555) 345-9800",
    rating: 4.6,
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    locationName: "Rincon Hill Clinics"
  }
];

export const MOCK_REQUESTS: BloodRequest[] = [
  {
    id: "req_101",
    patientName: "Robert Miller",
    bloodGroup: "O-",
    hospitalName: "California Pacific Medical Center",
    unitsNeeded: 3,
    urgency: "CRITICAL",
    reason: "Emergency gastrointestinal bleed secondary to arterial erosion.",
    status: "Broadcasting",
    latitude: 37.7760,
    longitude: -122.4140,
    createdAt: "2026-05-30T01:10:00Z",
    contactPhone: "+1 (555) 902-1234"
  },
  {
    id: "req_102",
    patientName: "Baby Jane Doe",
    bloodGroup: "A-",
    hospitalName: "San Francisco General Hospital",
    unitsNeeded: 2,
    urgency: "HIGH",
    reason: "Severe neonatal anemia requiring emergent exchange transfusion.",
    status: "Matched",
    latitude: 37.7554,
    longitude: -122.4048,
    donorId: "donor_1",
    createdAt: "2026-05-30T01:30:00Z",
    contactPhone: "+1 (555) 456-1199"
  }
];

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: "post_1",
    author: "Jennifer Lawrence",
    role: "A- Donor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    content: "Just finished my 10th donation session today! Sutter Health staff were extremely supportive. Blood AI made the booking flawless, and knowing my blood is headed to UCSF Pediatric Emergency feels incredible.",
    likes: 42,
    comments: 8,
    timeAgo: "2 hours ago",
    tag: "Inspirational Story"
  },
  {
    id: "post_2",
    author: "Zack Snyder",
    role: "Patient Advocate",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    content: "URGENT WARNING: St. Mary's General is experiencing a brief seasonal deficit in O-negative packed red blood cells. Please share and encourage your contacts within a 5-mile radius to set their Blood AI app to On Duty status!",
    likes: 125,
    comments: 24,
    timeAgo: "4 hours ago",
    tag: "Blood Drive Alert"
  },
  {
    id: "post_3",
    author: "Dr. Linda Zhao",
    role: "Chief Hematologist",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=120&auto=format&fit=crop&q=80",
    content: "Did you know that platelet donations are critical for cancer patients on chemo? While whole blood takes 1 hour, platelets take roughly 2 hours but can save multiple pediatric trauma cases! Check eligibility today in-app.",
    likes: 98,
    comments: 11,
    timeAgo: "1 day ago",
    tag: "Medical Advice"
  }
];

export const MOCK_BADGES: RewardBadge[] = [
  {
    id: "badge_1",
    title: "Guardian of Life",
    description: "Awarded for completing your first critical whole blood donation matching service.",
    iconName: "ShieldAlert",
    unlocked: true,
    dateUnlocked: "2026-03-12",
    requirement: "Complete 1 emergency reservation match.",
    progress: 100
  },
  {
    id: "badge_2",
    title: "Universal Sentinel",
    description: "O-Negative donor specific. Awarded for multiple universal red blood cells donations.",
    iconName: "Globe",
    unlocked: true,
    dateUnlocked: "2026-04-20",
    requirement: "Successfully log 2 donations of type O-.",
    progress: 100
  },
  {
    id: "badge_3",
    title: "Century Club Elite",
    description: "Amass a combined donor score of 100 reward points from matches and drive support.",
    iconName: "Award",
    unlocked: false,
    requirement: "Gain 100 active reward points.",
    progress: 35
  },
  {
    id: "badge_4",
    title: "Golden Hour Responder",
    description: "Arrive at hospital emergency room within 45 minutes of request confirmation.",
    iconName: "Zap",
    unlocked: false,
    requirement: "Accept and fulfill an emergency request in under 45 minutes.",
    progress: 0
  }
];

export const MOCK_HISTORY: DonationRecord[] = [
  {
    id: "hist_1",
    date: "2026-03-12",
    hospitalName: "California Pacific Medical Center",
    units: 1,
    bloodGroup: "O-",
    status: "Completed",
    certificateId: "CERT-99201-CPM"
  },
  {
    id: "hist_2",
    date: "2026-04-20",
    hospitalName: "San Francisco General Hospital",
    units: 1,
    bloodGroup: "O-",
    status: "Completed",
    certificateId: "CERT-74102-SFG"
  }
];

export const FAQS = [
  {
    q: "How frequently can I donate whole blood?",
    a: "Under FDA and Red Cross guidelines, you must wait at least 56 days (8 weeks) between consecutive whole blood physical donations to allow your red blood red cell count to regenerate fully."
  },
  {
    q: "What benefits does Blood AI matching AI provide?",
    a: "The smart system parses donor locations and blood pheno antigens to match patients to nearby donors with direct compatible blood types. This minimizes transport delay during emergency triage."
  },
  {
    q: "What is Offline SMS Emergency Mode?",
    a: "If your device suffers a loss of internet connection (cellular data blackout), Blood AI shifts into an offline protocol. It generates localized encrypted SMS request payloads and broadcasts them directly to nearby registered mobile numbers via native SMS towers."
  },
  {
    q: "Can I donate if I recently got a tattoo or ear piercing?",
    a: "If the tattoo or piercing was done in a state-licensed facility using sterile, single-use needles, there is usually no deferral. Otherwise, standard guidelines prescribe a temporary 3-month wait period."
  },
  {
    q: "Is my personal address or phone number shared with the patient?",
    a: "Never. Blood AI utilizes end-to-end encrypted voice calling and sandboxed chat masking. Your exact physical location is only visible during active, agreed-upon route navigation on the way to the emergency hospital."
  }
];

export const HOSPITALS = [
  {
    name: "California Pacific Medical Center (CPMC)",
    address: "1101 Van Ness Ave, San Francisco, CA 94109",
    phone: "+1 (415) 600-6000",
    bloodInventory: { "O-": "CRITICAL (1 Unit)", "O+": "Normal (14 Units)", "A-": "Low (3 Units)", "AB+": "Normal (20 Units)" },
    contactEmail: "emergency_blood@cpmc-sutter.org"
  },
  {
    name: "Zuckerberg San Francisco General Hospital (ZSFG)",
    address: "1001 Potrero Ave, San Francisco, CA 94110",
    phone: "+1 (628) 206-8000",
    bloodInventory: { "O-": "LOW (2 Units)", "A+": "Normal (18 Units)", "B-": "Low (1 Unit)", "AB-": "Critical (0 Units)" },
    contactEmail: "bloodbanksf@ucsf.edu"
  }
];
