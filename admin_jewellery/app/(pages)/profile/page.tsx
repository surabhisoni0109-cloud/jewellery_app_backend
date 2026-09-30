"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ProfilePage() {
  const { admin, updateAdmin } = useAuth();

  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(admin?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setEmail(admin.email || "");
      if (admin.avatar) setAvatarPreview(admin.avatar);
    }
  }, [admin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (name.trim()) formData.append("name", name.trim());
      if (email.trim()) formData.append("email", email.trim());
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await api.patch("/admin/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data.data;
      updateAdmin(updated);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your admin name, email, and profile picture.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-theme-xs">
          {/* Avatar section */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-700 h-28 relative" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 overflow-hidden bg-brand-500 shadow-theme-md">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {admin?.name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white hover:bg-brand-600 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              <div className="pb-1">
                <p className="font-semibold text-gray-900 dark:text-white">{admin?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Super Admin"
                    className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jewellery.com"
                    className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="save-profile"
                  type="submit"
                  disabled={loading}
                  className="h-11 px-8 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z"/>
                      </svg>
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
