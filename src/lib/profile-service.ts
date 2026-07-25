import { SchoolProfile } from "@/types";

const PROFILES_STORAGE_KEY = "smart_paper_school_profiles";

const DEFAULT_PROFILES: SchoolProfile[] = [
  {
    id: "preset_karan_sir",
    profileName: "Karan Sir Classes",
    schoolName: "SUPERIOR ACADEMY OF SCIENCE & COMPUTERS",
    teacherName: "Karan Sir",
    instructionsText: "1. All questions are compulsory.\n2. Write answers clearly and neat diagrams wherever necessary.\n3. Log tables & calculators are strictly prohibited.",
    isDefault: true,
  },
];

export const ProfileService = {
  getProfiles(): SchoolProfile[] {
    if (typeof window === "undefined") return DEFAULT_PROFILES;
    try {
      const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
        return DEFAULT_PROFILES;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
    } catch (e) {
      console.error("Failed to load school profiles:", e);
      return DEFAULT_PROFILES;
    }
  },

  saveProfile(profileData: {
    profileName: string;
    schoolName: string;
    teacherName: string;
    instructionsText?: string;
    logoUrl?: string;
  }): SchoolProfile {
    const profiles = this.getProfiles();
    const newProfile: SchoolProfile = {
      id: `profile_${Math.random().toString(36).substring(2, 9)}`,
      profileName: profileData.profileName || profileData.schoolName || "My Saved Profile",
      schoolName: profileData.schoolName,
      teacherName: profileData.teacherName,
      instructionsText: profileData.instructionsText,
      logoUrl: profileData.logoUrl,
      isDefault: profiles.length === 0,
    };

    const updated = [...profiles, newProfile];
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
    }
    return newProfile;
  },

  deleteProfile(id: string): void {
    const profiles = this.getProfiles();
    const updated = profiles.filter((p) => p.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  setDefaultProfile(id: string): void {
    const profiles = this.getProfiles();
    const updated = profiles.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
    }
  },
};
