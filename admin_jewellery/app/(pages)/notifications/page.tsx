"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface BroadcastHistoryItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  targetAudience: "USERS" | "VENDORS" | "BOTH" | string;
  createdAt: string;
  recipientCount?: number;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function NotificationsPage() {
  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sendToUsers, setSendToUsers] = useState(true);
  const [sendToVendors, setSendToVendors] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Custom Modal State (replaces window.confirm)
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // History State
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch History
  const fetchHistory = useCallback(async (targetPage = 1) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/admin/notifications/history?page=${targetPage}&limit=5`);
      const payload = res.data?.data;
      const historyList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setHistory(historyList);

      const meta = payload?.meta || res.data?.meta;
      if (meta) {
        setPage(meta.page || 1);
        setTotalPages(meta.totalPages || 1);
        setTotalItems(meta.total || 0);
      }
    } catch {
      // Silently catch history fetch error on initial load
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  // Handle File Pick
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Invalid file format. Please upload JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  // Open Custom Modal on Submit
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }

    if (!body.trim()) {
      toast.error("Please enter a notification description/message");
      return;
    }

    if (!sendToUsers && !sendToVendors) {
      toast.error("Please select at least one target audience (Users or Vendors)");
      return;
    }

    setShowConfirmModal(true);
  };

  // Execute Broadcast after modal confirmation
  const handleExecuteBroadcast = async () => {
    const targets: ("USER" | "VENDOR")[] = [];
    if (sendToUsers) targets.push("USER");
    if (sendToVendors) targets.push("VENDOR");

    setIsSending(true);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("body", body.trim());
        targets.forEach((t) => formData.append("targets", t));
        formData.append("image", imageFile);

        res = await api.post("/admin/notifications/broadcast", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload: any = {
          title: title.trim(),
          body: body.trim(),
          targets,
        };
        if (imageUrl.trim()) {
          payload.imageUrl = imageUrl.trim();
        }
        res = await api.post("/admin/notifications/broadcast", payload);
      }

      const data = res.data;
      toast.success(
        data?.message || `Notification sent to ${data?.totalUsers || 0} recipients!`
      );

      // Reset Form & Close Modal
      setTitle("");
      setBody("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      setSendToUsers(true);
      setSendToVendors(false);
      setShowConfirmModal(false);

      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh History
      fetchHistory(1);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to send broadcast notification";
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const getTargetBadge = (target: string) => {
    switch (target) {
      case "BOTH":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Both (Users & Vendors)
          </span>
        );
      case "USERS":
      case "USER":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Customers (Users)
          </span>
        );
      case "VENDORS":
      case "VENDOR":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Vendors (Jewellers)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {target}
          </span>
        );
    }
  };

  const targetLabel =
    sendToUsers && sendToVendors
      ? "Both (Customers & Vendors)"
      : sendToUsers
        ? "Customers (Users)"
        : sendToVendors
          ? "Vendors (Stores)"
          : "None";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Push & In-App Notifications</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Broadcast push notifications directly to customer mobile apps, vendor dashboards, or both.
        </p>
      </div>

      {/* Main Grid: Form + Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleOpenConfirm}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Compose Broadcast Message
              </h2>
              <span className="text-xs text-gray-400 font-medium">Firebase Cloud Messaging</span>
            </div>

            {/* Target Audience Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                Send Notification To: <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Users Checkbox Card */}
                <label
                  className={`relative flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    sendToUsers
                      ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendToUsers}
                    onChange={(e) => setSendToUsers(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <div className="ml-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Customers / Users</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Buyer Mobile Apps</p>
                    </div>
                  </div>
                </label>

                {/* Vendors Checkbox Card */}
                <label
                  className={`relative flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    sendToVendors
                      ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendToVendors}
                    onChange={(e) => setSendToVendors(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <div className="ml-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Vendors / Stores</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Jewellery Store Owners</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Quick Select Actions */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>Quick selection:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSendToUsers(true);
                    setSendToVendors(true);
                  }}
                  className="text-brand-600 hover:underline font-medium"
                >
                  Select Both
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setSendToUsers(true);
                    setSendToVendors(false);
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Only Users
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setSendToUsers(false);
                    setSendToVendors(true);
                  }}
                  className="text-amber-600 hover:underline font-medium"
                >
                  Only Vendors
                </button>
              </div>
            </div>

            {/* Notification Title */}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ✨ Festive Special Discounts Live Now!"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
              />
              <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                <span>Brief, attention-grabbing headline</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            {/* Notification Description */}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
                Notification Description / Body <span className="text-red-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. Explore exclusive discounts up to 25% on gold & diamond jewellery across certified marketplace stores."
                rows={4}
                maxLength={300}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                required
              />
              <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                <span>Message text in the notification drawer</span>
                <span>{body.length}/300</span>
              </div>
            </div>

            {/* Banner Image Upload & URL Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Banner Image <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      uploadMode === "file"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      uploadMode === "url"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {uploadMode === "file" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                          : "border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600 bg-gray-50/50 dark:bg-gray-800/30"
                      }`}
                    >
                      <div className="w-10 h-10 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Click to upload image or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, or WebP up to 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Banner Preview"
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                            {imageFile ? imageFile.name : "Attached Image"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {imageFile
                              ? `${(imageFile.size / 1024).toFixed(1)} KB`
                              : "Selected"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImageUrl(val);
                        setImagePreview(val.trim() || null);
                      }}
                      placeholder="https://example.com/banner.jpg"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-2 text-xs text-red-500 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Direct public URL to an image file (PNG, JPG, WebP)
                  </p>
                </div>
              )}
            </div>

            {/* Broadcast Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!sendToUsers && !sendToVendors}
                className={`w-full py-3.5 px-5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  !sendToUsers && !sendToVendors
                    ? "bg-gray-400 cursor-not-allowed opacity-75"
                    : "bg-brand-500 hover:bg-brand-600 active:scale-[0.99] shadow-brand-500/25"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Broadcast to {targetLabel}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Mobile Mockup Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Mobile Screen Live Preview
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
                Realtime
              </span>
            </div>

            {/* Smartphone frame container */}
            <div className="mx-auto max-w-[320px] bg-gray-900 dark:bg-black rounded-[36px] p-3 shadow-2xl border-4 border-gray-800">
              {/* Phone Notch */}
              <div className="w-28 h-4 bg-gray-800 rounded-full mx-auto mb-3"></div>

              {/* Phone screen wallpaper */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[26px] p-3 min-h-[380px] flex flex-col justify-start">
                <div className="text-center text-white/50 text-[10px] font-medium mb-4">
                  Lock Screen Notification Preview
                </div>

                {/* Notification Card */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-white/20 text-gray-900 dark:text-white transition-all">
                  {/* Top Bar: Icon + App Name + Time */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold">
                        💎
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                        Jewellery App
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">now</span>
                  </div>

                  {/* Notification Content */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">
                      {title.trim() || "Notification Title Here..."}
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {body.trim() || "Notification description will appear here as you type in the form..."}
                    </p>
                  </div>

                  {/* Banner image preview if present */}
                  {imagePreview && (
                    <div className="mt-2.5 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-28 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Notification Banner"
                        className="w-full h-28 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Target pill */}
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Target:</span>
                    <span className="font-medium text-brand-600 dark:text-brand-400">
                      {targetLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone home indicator */}
              <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sent Broadcast History */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Broadcast History
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Log of recent notifications dispatched via the admin dashboard ({totalItems} total)
            </p>
          </div>

          <button
            onClick={() => fetchHistory(page)}
            disabled={historyLoading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1.5 transition-all"
          >
            <svg
              className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          {historyLoading && (!Array.isArray(history) || history.length === 0) ? (
            <div className="p-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z" />
              </svg>
              Loading history...
            </div>
          ) : !Array.isArray(history) || history.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              No broadcast notifications have been sent yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5">Title & Message</th>
                  <th className="px-6 py-3.5">Target Audience</th>
                  <th className="px-6 py-3.5">Recipients</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.isArray(history) &&
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0 mt-0.5"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 max-w-lg">
                              {item.body}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTargetBadge(item.targetAudience)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          {item.recipientCount ? `${item.recipientCount} users` : "Delivered"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || historyLoading}
                onClick={() => fetchHistory(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages || historyLoading}
                onClick={() => fetchHistory(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Custom Confirmation Modal ────────────────────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5 animate-scale-up"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Confirm Broadcast
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Review notification details before broadcasting
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSending}
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Card in Modal */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Target Audience
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {targetLabel}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Title
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {title}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Message
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-24 overflow-y-auto">
                  {body}
                </p>
              </div>

              {imagePreview && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Banner"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                  />
                  <div className="text-xs min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Banner attached</p>
                    <p className="text-gray-400 truncate max-w-[240px]">
                      {imageFile ? imageFile.name : imageUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>
                This will trigger push notifications to all active user mobile apps immediately. This action cannot be undone.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSending}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleExecuteBroadcast}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z" />
                    </svg>
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Yes, Broadcast Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
