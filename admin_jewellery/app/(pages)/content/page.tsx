"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type LegalPageType = "PRIVACY_POLICY" | "TERMS_AND_CONDITIONS" | "ABOUT_US";

interface ContentPageData {
  id?: string;
  type: LegalPageType;
  title: string;
  content: string;
  lastUpdatedBy?: string | null;
  updatedAt?: string;
}

interface CompanyContactData {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  supportHours: string;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "PENDING" | "RESOLVED";
  adminNote?: string | null;
  createdAt: string;
}

export default function ContentManagementPage() {
  // Main Navigation Tabs
  const [mainTab, setMainTab] = useState<"pages" | "contact">("pages");

  // ── Pages State ──────────────────────────────────────────────────────────
  const [selectedPage, setSelectedPage] =
    useState<LegalPageType>("PRIVACY_POLICY");
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [pagesLoading, setPagesLoading] = useState<boolean>(true);
  const [savingPage, setSavingPage] = useState<boolean>(false);
  const [pagesData, setPagesData] = useState<Record<LegalPageType, ContentPageData>>({
    PRIVACY_POLICY: {
      type: "PRIVACY_POLICY",
      title: "Privacy Policy",
      content: "",
    },
    TERMS_AND_CONDITIONS: {
      type: "TERMS_AND_CONDITIONS",
      title: "Terms and Conditions",
      content: "",
    },
    ABOUT_US: {
      type: "ABOUT_US",
      title: "About Us",
      content: "",
    },
  });

  // Current selected page values
  const currentTitle = pagesData[selectedPage]?.title || "";
  const currentContent = pagesData[selectedPage]?.content || "";
  const currentLastUpdated = pagesData[selectedPage]?.updatedAt;
  const currentUpdatedBy = pagesData[selectedPage]?.lastUpdatedBy;

  // ── Contact State ────────────────────────────────────────────────────────
  const [contactLoading, setContactLoading] = useState<boolean>(true);
  const [savingContact, setSavingContact] = useState<boolean>(false);
  const [companyContact, setCompanyContact] = useState<CompanyContactData>({
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    supportHours: "",
  });

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState<boolean>(false);
  const [inquirySearch, setInquirySearch] = useState<string>("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>("ALL");
  const [inquiryPage, setInquiryPage] = useState<number>(1);
  const [totalInquiries, setTotalInquiries] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [inquiryAdminNote, setInquiryAdminNote] = useState<string>("");
  const [updatingInquiry, setUpdatingInquiry] = useState<boolean>(false);

  // ── Fetch Pages ──────────────────────────────────────────────────────────
  const fetchAllPages = useCallback(async () => {
    setPagesLoading(true);
    try {
      const res = await api.get("/admin/content");
      if (res.data?.data?.pages) {
        const mapping: any = { ...pagesData };
        res.data.data.pages.forEach((p: ContentPageData) => {
          mapping[p.type] = p;
        });
        setPagesData(mapping);
      }
    } catch {
      toast.error("Failed to load content pages");
    } finally {
      setPagesLoading(false);
    }
  }, []);

  // ── Fetch Company Contact ────────────────────────────────────────────────
  const fetchCompanyContact = useCallback(async () => {
    setContactLoading(true);
    try {
      const res = await api.get("/admin/contact/info");
      if (res.data?.data) {
        const d = res.data.data;
        setCompanyContact({
          email: d.email || "",
          phone: d.phone || "",
          whatsapp: d.whatsapp || "",
          address: d.address || "",
          supportHours: d.supportHours || "",
        });
      }
    } catch {
      toast.error("Failed to load company contact details");
    } finally {
      setContactLoading(false);
    }
  }, []);

  // ── Fetch User Inquiries ─────────────────────────────────────────────────
  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const params: any = { page: inquiryPage, limit: 10 };
      if (inquiryStatusFilter !== "ALL") {
        params.status = inquiryStatusFilter;
      }
      if (inquirySearch.trim()) {
        params.search = inquirySearch.trim();
      }

      const res = await api.get("/admin/contact/inquiries", { params });
      if (res.data?.data) {
        setInquiries(res.data.data.inquiries || []);
        setTotalInquiries(res.data.data.total || 0);
        setPendingCount(res.data.data.pendingCount || 0);
      }
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setInquiriesLoading(false);
    }
  }, [inquiryPage, inquiryStatusFilter, inquirySearch]);

  useEffect(() => {
    fetchAllPages();
    fetchCompanyContact();
  }, [fetchAllPages, fetchCompanyContact]);

  useEffect(() => {
    if (mainTab === "contact") {
      fetchInquiries();
    }
  }, [mainTab, fetchInquiries]);

  // ── Save Current Legal Page ──────────────────────────────────────────────
  const handleSavePage = async () => {
    if (!currentTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    if (!currentContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setSavingPage(true);
    try {
      const res = await api.post("/admin/content", {
        type: selectedPage,
        title: currentTitle.trim(),
        content: currentContent,
      });

      const updated = res.data.data;
      setPagesData((prev) => ({
        ...prev,
        [selectedPage]: updated,
      }));
      toast.success(`${currentTitle} published successfully!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to publish content");
    } finally {
      setSavingPage(false);
    }
  };

  // ── Save Company Contact Details ─────────────────────────────────────────
  const handleSaveCompanyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await api.put("/admin/contact/info", companyContact);
      toast.success(res.data?.message || "Contact details updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update contact info");
    } finally {
      setSavingContact(false);
    }
  };

  // ── Update Inquiry Status ────────────────────────────────────────────────
  const handleUpdateInquiryStatus = async (newStatus: "PENDING" | "RESOLVED") => {
    if (!selectedInquiry) return;
    setUpdatingInquiry(true);
    try {
      await api.patch(`/admin/contact/inquiries/${selectedInquiry.id}/status`, {
        status: newStatus,
        adminNote: inquiryAdminNote.trim() || undefined,
      });
      toast.success(`Inquiry marked as ${newStatus}`);
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingInquiry(false);
    }
  };

  // ── Editor Markdown Helpers ──────────────────────────────────────────────
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      "content-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentContent;
    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || "text") + suffix;

    const newContent =
      text.substring(0, start) + replacement + text.substring(end);
    setPagesData((prev) => ({
      ...prev,
      [selectedPage]: {
        ...prev[selectedPage],
        content: newContent,
      },
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage legal documents, about us page, company contact details, and incoming customer inquiries.
          </p>
        </div>

        {/* Public API Endpoint Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Public App API: <code className="font-mono">/api/content</code> & <code className="font-mono">/api/contact/info</code>
        </div>
      </div>

      {/* ── Primary Main Tabs (Legal Pages vs Contact Us) ────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setMainTab("pages")}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            mainTab === "pages"
              ? "border-brand-500 text-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Legal & Info Pages
        </button>

        <button
          onClick={() => setMainTab("contact")}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            mainTab === "contact"
              ? "border-brand-500 text-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Contact Us & Inquiries
          {pendingCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: LEGAL & INFO PAGES (Privacy Policy, Terms, About Us) ──────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {mainTab === "pages" && (
        <div className="space-y-6">
          {/* Sub-tabs pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "PRIVACY_POLICY", label: "Privacy Policy", icon: "🔒" },
                  { key: "TERMS_AND_CONDITIONS", label: "Terms & Conditions", icon: "📜" },
                  { key: "ABOUT_US", label: "About Us", icon: "🏢" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedPage(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                    selectedPage === tab.key
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mode Toggle (Edit vs Preview) */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  !previewMode
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                ✏️ Edit Mode
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  previewMode
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                👁️ Preview Mode
              </button>
            </div>
          </div>

          {pagesLoading ? (
            <div className="flex items-center justify-center p-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-6">
              {/* Metadata Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {pagesData[selectedPage]?.title}
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {selectedPage}
                    </span>
                  </h2>
                  {currentLastUpdated && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Last published on {new Date(currentLastUpdated).toLocaleDateString()} at{" "}
                      {new Date(currentLastUpdated).toLocaleTimeString()}
                      {currentUpdatedBy ? ` by ${currentUpdatedBy}` : ""}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`http://localhost:3000/api/content/${selectedPage.toLowerCase().replace(/_/g, "-")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-500 hover:underline flex items-center gap-1 font-medium"
                  >
                    Test App API Endpoint ↗
                  </a>
                </div>
              </div>

              {!previewMode ? (
                /* ── Edit Mode ──────────────────────────────────────────────── */
                <div className="space-y-4">
                  {/* Page Title Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Page Display Title
                    </label>
                    <input
                      type="text"
                      value={currentTitle}
                      onChange={(e) =>
                        setPagesData((prev) => ({
                          ...prev,
                          [selectedPage]: {
                            ...prev[selectedPage],
                            title: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      placeholder="e.g. Privacy Policy"
                    />
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/60 text-xs">
                    <span className="text-gray-400 font-semibold px-1">Format:</span>
                    <button
                      type="button"
                      onClick={() => insertFormatting("## ")}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-bold hover:bg-gray-100 text-gray-800 dark:text-gray-200"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("### ")}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-bold hover:bg-gray-100 text-gray-800 dark:text-gray-200"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("**", "**")}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-bold hover:bg-gray-100 text-gray-800 dark:text-gray-200"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("*", "*")}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 italic hover:bg-gray-100 text-gray-800 dark:text-gray-200"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("- ")}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 text-gray-800 dark:text-gray-200"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("> ")}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 text-gray-800 dark:text-gray-200"
                      title="Quote"
                    >
                      ❝ Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("\n---\n")}
                      className="px-2 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 text-gray-800 dark:text-gray-200"
                      title="Divider"
                    >
                      ― Divider
                    </button>
                  </div>

                  {/* Body Content Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Page Content (Supports Markdown & Formatting)
                    </label>
                    <textarea
                      id="content-textarea"
                      rows={18}
                      value={currentContent}
                      onChange={(e) =>
                        setPagesData((prev) => ({
                          ...prev,
                          [selectedPage]: {
                            ...prev[selectedPage],
                            content: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      placeholder="Write your policy or page details here..."
                    />
                  </div>

                  {/* Character stats & Save Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentContent.length} characters •{" "}
                      {currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0} words
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={fetchAllPages}
                        disabled={savingPage}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        Discard Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePage}
                        disabled={savingPage}
                        className="px-6 py-2 text-sm font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition flex items-center gap-2"
                      >
                        {savingPage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Publishing...
                          </>
                        ) : (
                          <>💾 Save & Publish</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Preview Mode ───────────────────────────────────────────── */
                <div className="space-y-4">
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700/60 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                      {currentTitle}
                    </h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {currentContent}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: CONTACT US & INCOMING INQUIRIES ───────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {mainTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left Column: Company Contact Details Form (4 cols) ──────────── */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Company Contact Info
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Displayed to all mobile app users on the Contact Us screen.
                </p>
              </div>
            </div>

            {contactLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSaveCompanyContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={companyContact.email}
                    onChange={(e) =>
                      setCompanyContact({ ...companyContact, email: e.target.value })
                    }
                    placeholder="support@jewellery.com"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Customer Helpline Phone
                  </label>
                  <input
                    type="text"
                    value={companyContact.phone}
                    onChange={(e) =>
                      setCompanyContact({ ...companyContact, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    WhatsApp Support Number
                  </label>
                  <input
                    type="text"
                    value={companyContact.whatsapp}
                    onChange={(e) =>
                      setCompanyContact({ ...companyContact, whatsapp: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Physical Store / Office Address
                  </label>
                  <textarea
                    rows={3}
                    value={companyContact.address}
                    onChange={(e) =>
                      setCompanyContact({ ...companyContact, address: e.target.value })
                    }
                    placeholder="123 Jewellery Bazaar, Mumbai..."
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Support Operational Hours
                  </label>
                  <input
                    type="text"
                    value={companyContact.supportHours}
                    onChange={(e) =>
                      setCompanyContact({
                        ...companyContact,
                        supportHours: e.target.value,
                      })
                    }
                    placeholder="Mon - Sat: 10:00 AM - 7:00 PM IST"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingContact}
                    className="w-full py-2.5 rounded-lg bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {savingContact ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      "💾 Update Company Contact Details"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Right Column: Incoming Customer Inquiries Inbox (7 cols) ───── */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Customer Inquiries
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-normal">
                    {totalInquiries} total
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Messages submitted by users from the mobile application.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-xs">
                {(["ALL", "PENDING", "RESOLVED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setInquiryStatusFilter(st);
                      setInquiryPage(1);
                    }}
                    className={`px-3 py-1 font-semibold rounded-md transition ${
                      inquiryStatusFilter === st
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {st === "ALL" ? "All" : st === "PENDING" ? "Pending" : "Resolved"}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="Search inquiries by name, email, or message..."
                className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                onClick={() => fetchInquiries()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition"
              >
                Search
              </button>
            </div>

            {/* Inquiries List */}
            {inquiriesLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No inquiries found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setSelectedInquiry(inq);
                      setInquiryAdminNote(inq.adminNote || "");
                    }}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 cursor-pointer transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {inq.name}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          • {inq.email}
                        </span>
                        {inq.phone && (
                          <span className="text-xs text-gray-400">
                            • {inq.phone}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          inq.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    {inq.subject && (
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {inq.subject}
                      </p>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {inq.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                      <span>{new Date(inq.createdAt).toLocaleString()}</span>
                      <span className="text-brand-500 font-medium">
                        View details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Inquiry Detail Modal ─────────────────────────────────────────────── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Customer Inquiry
                </h3>
                <p className="text-xs text-gray-500">
                  Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 block">Name</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedInquiry.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Email</span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-semibold text-brand-500 hover:underline"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <span className="text-gray-400 block">Phone</span>
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="font-semibold text-gray-900 dark:text-white hover:underline"
                    >
                      {selectedInquiry.phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block">Current Status</span>
                  <span
                    className={`font-bold ${
                      selectedInquiry.status === "RESOLVED"
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }`}
                  >
                    {selectedInquiry.status}
                  </span>
                </div>
              </div>

              {selectedInquiry.subject && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 block">
                    Subject
                  </label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedInquiry.subject}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Message
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Internal Admin Resolution Note
                </label>
                <textarea
                  rows={3}
                  value={inquiryAdminNote}
                  onChange={(e) => setInquiryAdminNote(e.target.value)}
                  placeholder="e.g. Replied via email on 3rd Oct with customized ring brochure."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Close
              </button>

              {selectedInquiry.status === "PENDING" ? (
                <button
                  type="button"
                  disabled={updatingInquiry}
                  onClick={() => handleUpdateInquiryStatus("RESOLVED")}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  ✓ Mark as Resolved
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingInquiry}
                  onClick={() => handleUpdateInquiryStatus("PENDING")}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  ↺ Re-open as Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
