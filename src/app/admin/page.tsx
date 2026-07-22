"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/landing/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthService } from "@/lib/firebase/auth-service";
import { DatabaseUser } from "@/types/db";
import { UserRole, UserPlan } from "@/types/auth";
import {
  ShieldAlert,
  Users,
  FileText,
  Crown,
  Search,
  Loader2,
  Trash2,
  UserCheck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  papersGeneratedToday: number;
  proUsers: number;
  premiumUsers: number;
  admins: number;
}

export default function AdminDashboardPage() {
  const { dbUser } = useAuth();
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = await AuthService.getFirebaseToken();
      if (!token) return;

      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data.users);
        setStats(json.data.stats);
      } else {
        toast.error(json.error?.message || "Failed to load admin data.");
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Failed to load admin panel data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser?.role === "ADMIN") {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [dbUser]);

  const handleUpdateRole = async (targetUid: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setProcessingUid(targetUid);
    try {
      const token = await AuthService.getFirebaseToken();
      if (!token) return;

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetFirebaseUid: targetUid,
          action: "update_role",
          role: newRole,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`User role updated to ${newRole}`);
        await fetchAdminData();
      } else {
        toast.error(json.error?.message || "Role update failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role.");
    } finally {
      setProcessingUid(null);
    }
  };

  const handleUpdatePlan = async (targetUid: string, newPlan: UserPlan) => {
    setProcessingUid(targetUid);
    try {
      const token = await AuthService.getFirebaseToken();
      if (!token) return;

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetFirebaseUid: targetUid,
          action: "update_plan",
          plan: newPlan,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`User plan updated to ${newPlan}`);
        await fetchAdminData();
      } else {
        toast.error(json.error?.message || "Plan update failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update plan.");
    } finally {
      setProcessingUid(null);
    }
  };

  const handleDeleteUser = async (targetUid: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) return;

    setProcessingUid(targetUid);
    try {
      const token = await AuthService.getFirebaseToken();
      if (!token) return;

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetFirebaseUid: targetUid,
          action: "delete_user",
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`User ${userEmail} deleted successfully.`);
        await fetchAdminData();
      } else {
        toast.error(json.error?.message || "Delete user failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user.");
    } finally {
      setProcessingUid(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q));
  });

  if (dbUser && dbUser.role !== "ADMIN") {
    return (
      <>
        <AnimatedBackground />
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center px-4 pt-28">
          <GlassCard className="max-w-md text-center p-8 space-y-4 border-rose-500/30">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-2xl font-bold font-heading">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You do not have Administrator privileges required to access the Admin Panel.
            </p>
          </GlassCard>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <ProtectedRoute requireEmailVerification={false}>
          <div className="container mx-auto px-4 max-w-7xl space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Control Center</span>
                </div>
                <h1 className="text-3xl font-extrabold font-heading tracking-tight">Admin Dashboard</h1>
              </div>

              <Button
                variant="outline"
                onClick={fetchAdminData}
                disabled={loading}
                className="rounded-xl border-border/60 text-xs flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </div>

            {/* Platform Analytics Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Total Users</p>
                    <p className="text-2xl font-extrabold font-heading">{stats.totalUsers}</p>
                  </div>
                </GlassCard>

                <GlassCard className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Papers Generated Today</p>
                    <p className="text-2xl font-extrabold font-heading">{stats.papersGeneratedToday}</p>
                  </div>
                </GlassCard>

                <GlassCard className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Pro / Premium Plans</p>
                    <p className="text-2xl font-extrabold font-heading">{stats.proUsers + stats.premiumUsers}</p>
                  </div>
                </GlassCard>

                <GlassCard className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Admins</p>
                    <p className="text-2xl font-extrabold font-heading">{stats.admins}</p>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Search Filter Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search user by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/60 rounded-xl"
              />
            </div>

            {/* Users Management Table */}
            <GlassCard className="p-6 overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Loading users database...</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 px-3">User</th>
                      <th className="pb-3 px-3">Provider</th>
                      <th className="pb-3 px-3">Role</th>
                      <th className="pb-3 px-3">Plan</th>
                      <th className="pb-3 px-3">Joined</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredUsers.map((user) => {
                      const isBusy = processingUid === user.firebase_uid;
                      const dateStr = new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      });

                      return (
                        <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-foreground">{user.name || "No Name"}</div>
                            <div className="text-[11px] text-muted-foreground">{user.email}</div>
                          </td>

                          <td className="py-3.5 px-3 uppercase text-[11px] font-mono">
                            {user.provider}
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                user.role === "ADMIN"
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <select
                              value={user.plan}
                              disabled={isBusy}
                              onChange={(e) => handleUpdatePlan(user.firebase_uid, e.target.value as UserPlan)}
                              className="bg-background/80 border border-border/60 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
                            >
                              <option value="FREE">FREE</option>
                              <option value="PRO">PRO</option>
                              <option value="PREMIUM">PREMIUM</option>
                              <option value="ENTERPRISE">ENTERPRISE</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-3 text-muted-foreground">{dateStr}</td>

                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => handleUpdateRole(user.firebase_uid, user.role)}
                                className="h-7 text-[11px] px-2.5 rounded-lg border-border/60"
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                {user.role === "ADMIN" ? "Demote" : "Make Admin"}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => handleDeleteUser(user.firebase_uid, user.email)}
                                className="h-7 text-[11px] px-2 text-destructive hover:bg-destructive/10 border-destructive/30 rounded-lg"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </GlassCard>
          </div>
        </ProtectedRoute>
      </main>

      <Footer />
    </>
  );
}
