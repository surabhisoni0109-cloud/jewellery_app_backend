"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/admin/auth/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const EyeToggle = ({ visible, onClick }: { visible: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="text-gray-400 hover:text-gray-600">
      {visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );

  const PasswordField = ({
    id, label, value, onChange, visible, onToggle, placeholder
  }: {
    id: string; label: string; value: string;
    onChange: (v: string) => void; visible: boolean;
    onToggle: () => void; placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          required
          className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <EyeToggle visible={visible} onClick={onToggle} />
        </div>
      </div>
    </div>
  );

  const passwordStrength = () => {
    if (!newPassword) return null;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    const levels = [
      { label: "Weak", color: "bg-error-500", width: "w-1/4" },
      { label: "Fair", color: "bg-warning-500", width: "w-2/4" },
      { label: "Good", color: "bg-brand-400", width: "w-3/4" },
      { label: "Strong", color: "bg-success-500", width: "w-full" },
    ];
    return levels[Math.min(score, 3)];
  };

  const strength = passwordStrength();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your account password. Use a strong, unique password.
        </p>
      </div>

      <div className="max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
          {/* Security tip */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-brand-500 shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-brand-700 dark:text-brand-300">
              Use at least 8 characters with uppercase letters, numbers, and symbols for a strong password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              id="current-password"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              visible={show.current}
              onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
            />

            <PasswordField
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              visible={show.newPw}
              onToggle={() => setShow((s) => ({ ...s, newPw: !s.newPw }))}
              placeholder="Min. 6 characters"
            />

            {/* Strength meter */}
            {strength && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Password strength</span>
                  <span className={`text-xs font-medium ${strength.label === "Strong" ? "text-success-600" : strength.label === "Good" ? "text-brand-500" : strength.label === "Fair" ? "text-warning-500" : "text-error-500"}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
              </div>
            )}

            <PasswordField
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={show.confirm}
              onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            />

            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-error-500 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                Passwords do not match
              </p>
            )}

            <div className="pt-2">
              <button
                id="change-password-submit"
                type="submit"
                disabled={loading || (!!confirmPassword && newPassword !== confirmPassword)}
                className="w-full h-11 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z"/>
                    </svg>
                    Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
