"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";
import { ChevronLeft, Plus, X, Upload, Globe } from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;

type ModelType = "qwen2.5-1.5b" | "qwen2.5-3b" | "gemma-4-e2b" | "gemma-4-e4b";

interface FormData {
  modelType: ModelType;
  genre: string;
  purpose: string;
  urls: string[];
  files: File[];
}

interface FileContent {
  name: string;
  content: string;
}

const GENRE_KEYS = [
  "new.genres.customerSupport",
  "new.genres.internalKnowledge",
  "new.genres.writingSummary",
  "new.genres.programmingAssist",
  "new.genres.educationSupport",
  "new.genres.other",
];

const STEP_LABEL_KEYS = [
  "new.stepLabels.modelSelect",
  "new.stepLabels.usageSetting",
  "new.stepLabels.dataInput",
  "new.stepLabels.confirmStart",
];

const MODEL_KEY_MAP: Record<ModelType, string> = {
  "qwen2.5-1.5b": "qwen25_15b",
  "qwen2.5-3b": "qwen25_3b",
  "gemma-4-e2b": "gemma4_e2b",
  "gemma-4-e4b": "gemma4_e4b",
};

export default function NewProjectPage() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const GENRES = GENRE_KEYS.map((key) => t(key));
  const STEP_LABELS = STEP_LABEL_KEYS.map((key) => t(key));
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    modelType: "qwen2.5-3b",
    genre: "",
    purpose: "",
    urls: [],
    files: [],
  });
  const [newUrl, setNewUrl] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [fileContents, setFileContents] = useState<FileContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, modelType: e.target.value as ModelType });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, genre: e.target.value });
  };

  const handlePurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, purpose: e.target.value });
  };

  const handleAddUrl = () => {
    if (newUrl.trim() && formData.urls.length < 5) {
      setFormData({
        ...formData,
        urls: [...formData.urls, newUrl.trim()],
      });
      setNewUrl("");
    }
  };

  const handleRemoveUrl = (index: number) => {
    setFormData({
      ...formData,
      urls: formData.urls.filter((_, i) => i !== index),
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["txt", "pdf", "csv", "json"].includes(ext || "")) return false;
      if (file.size > MAX_FILE_SIZE) {
        alert(t("new.fileTooLarge", { name: file.name }));
        return false;
      }
      return true;
    });

    if (formData.files.length + validFiles.length <= 5) {
      const newFiles = [...formData.files, ...validFiles];
      setFormData({
        ...formData,
        files: newFiles,
      });

      // Only read text-based files client-side; PDFs are uploaded to API for pymupdf extraction
      const readPromises = validFiles.map((file) =>
        new Promise<FileContent>((resolve) => {
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (ext === "pdf") {
            // PDF: placeholder content, real extraction on server
            resolve({ name: file.name, content: "" });
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({ name: file.name, content: event.target?.result as string });
          };
          reader.readAsText(file);
        })
      );
      const newContents = await Promise.all(readPromises);
      setFileContents((prev) => [...prev, ...newContents]);
    }
  };

  // Derived char count: recompute from current state so multi-upload and
  // PDF removal stay consistent (avoids stale-closure regressions).
  useEffect(() => {
    const textChars = fileContents.reduce((acc, fc) => acc + fc.content.length, 0);
    const pdfEstimate = formData.files
      .filter((f) => f.name.toLowerCase().endsWith(".pdf"))
      .reduce((acc, f) => acc + Math.floor(f.size / 3), 0);
    setCharCount(textChars + pdfEstimate);
  }, [formData.files, fileContents]);

  const handleRemoveFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    const newFileContents = fileContents.filter((_, i) => i !== index);
    setFormData({ ...formData, files: newFiles });
    setFileContents(newFileContents);
    // charCount is recomputed via the derived useEffect above
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.modelType) return;
    if (currentStep === 2 && !formData.genre) return;
    if (currentStep === 3 && formData.urls.length === 0 && formData.files.length === 0) return;
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleStart = async () => {
    try {
      setIsLoading(true);

      // プロジェクト作成
      const projectName = `${formData.genre} - ${formData.purpose.substring(0, 20)}`;
      const project = await api.createProject({
        name: projectName,
        model_type: formData.modelType,
        genre: formData.genre,
        description: formData.purpose,
      });

      // URL + ファイルのデータソースを並列追加
      // PDF は multipart で API 側抽出、それ以外は client 側抽出済み content を POST
      const sourcePromises: Promise<unknown>[] = [];
      for (const url of formData.urls) {
        sourcePromises.push(api.addSource(project.id, {
          type: "url",
          name: url,
          content: url,
        }));
      }
      for (let i = 0; i < formData.files.length; i++) {
        const file = formData.files[i];
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") {
          sourcePromises.push(api.addSourceFile(project.id, file));
        } else {
          const fileContent = fileContents[i];
          if (fileContent && fileContent.content) {
            sourcePromises.push(api.addSource(project.id, {
              type: "file",
              name: fileContent.name,
              content: fileContent.content,
            }));
          }
        }
      }
      await Promise.all(sourcePromises);

      // チェックアウトURLを取得
      const checkout = await api.createCheckout(project.id);

      // Stripe URLを検証してから遷移
      const checkoutUrl = new URL(checkout.checkout_url);
      if (checkoutUrl.hostname.endsWith("stripe.com")) {
        window.location.href = checkout.checkout_url;
      } else {
        throw new Error("Invalid checkout URL");
      }
    } catch {
      alert(t("new.errorGeneric"));
      setIsLoading(false);
    }
  };

  const sourceCount = formData.urls.length + formData.files.length;
  const modelLabel = t(`new.models.${MODEL_KEY_MAP[formData.modelType]}.label`);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="logo-text text-lg font-bold cursor-pointer sm:text-xl">AI Rakuraku</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 cursor-pointer transition-colors duration-200 hover:border-white/[0.15] hover:text-white"
            >
              <Globe size={13} />
              {locale === "ja" ? "EN" : "JP"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors"
            >
              {"← " + t("detail.backToDashboard")}
            </button>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6">
        {/* Back to Dashboard Link */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 text-sm text-blue-400 cursor-pointer transition-colors hover:text-blue-300"
          >
            <ChevronLeft size={16} /><span>{t("new.backToDashboard")}</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors duration-200 ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                      : "bg-white/[0.06] text-zinc-500"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors duration-200 ${
                      step < currentStep
                        ? "bg-gradient-to-r from-blue-600 to-violet-600"
                        : "bg-white/[0.06]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`text-xs ${
                  i + 1 === currentStep
                    ? "text-blue-400 font-medium"
                    : "text-zinc-500"
                } ${i < 3 ? "w-[calc(25%-0.25rem)]" : ""}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          {/* Step 1: Model Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                {t("new.step1.title")}
              </h2>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {t("new.step1.label")}
                </label>
                <select
                  value={formData.modelType}
                  onChange={handleModelChange}
                  className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                >
                  <option value="qwen2.5-1.5b">{t("new.models.qwen25_15b.label")}</option>
                  <option value="qwen2.5-3b">{t("new.models.qwen25_3b.label")}</option>
                  <option value="gemma-4-e2b">{t("new.models.gemma4_e2b.label")}</option>
                  <option value="gemma-4-e4b">{t("new.models.gemma4_e4b.label")}</option>
                </select>
                <p className="text-sm text-zinc-400 mt-3">
                  {t(`new.models.${MODEL_KEY_MAP[formData.modelType]}.desc`)}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Usage Setting */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                {t("new.step2.title")}
              </h2>
              <div className="flex flex-col gap-6">
                {/* Genre Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t("new.step2.genre")}
                  </label>
                  <select
                    value={formData.genre}
                    onChange={handleGenreChange}
                    className="w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                  >
                    <option value="">{t("new.step2.genrePlaceholder")}</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Purpose Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t("new.step2.purpose")}
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={handlePurposeChange}
                    placeholder={t("new.step2.purposePlaceholder")}
                    rows={4}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data Input */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                {t("new.step3.title")}
              </h2>
              <div className="flex flex-col gap-6">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t("new.step3.urlLabel")}
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com"
                      onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                    />
                    <button
                      onClick={handleAddUrl}
                      disabled={!newUrl.trim() || formData.urls.length >= 5}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />{t("new.add")}
                    </button>
                  </div>
                  {formData.urls.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {formData.urls.map((url, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                        >
                          <span className="text-sm text-zinc-300 overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-3">
                            {url}
                          </span>
                          <button
                            onClick={() => handleRemoveUrl(idx)}
                            className="flex items-center gap-1 text-xs text-red-400 cursor-pointer hover:text-red-300 transition-colors flex-shrink-0"
                          >
                            <X size={14} />{t("new.delete")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t("new.step3.fileLabel")}
                  </label>
                  <div className="rounded-xl border-2 border-dashed border-white/[0.08] p-6 text-center cursor-pointer transition-colors hover:border-white/[0.15] hover:bg-white/[0.02]">
                    <input
                      type="file"
                      multiple
                      accept=".txt,.pdf,.csv,.json"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileInput"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer block">
                      <Upload size={20} className="text-zinc-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-zinc-300">
                        {t("new.step3.dragDrop")}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {t("new.step3.fileFormats")}
                      </p>
                    </label>
                  </div>
                  {formData.files.length > 0 && (
                    <ul className="flex flex-col gap-2 mt-3">
                      {formData.files.map((file, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                        >
                          <span className="text-sm text-zinc-300">{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            className="flex items-center gap-1 text-xs text-red-400 cursor-pointer hover:text-red-300 transition-colors flex-shrink-0 ml-3"
                          >
                            <X size={14} />{t("new.delete")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Counter */}
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <p className="text-sm text-zinc-300 mb-1">
                    <span className="font-semibold">{t("new.step3.sources")}</span>{" "}
                    {t("new.sourcesCount", { n: sourceCount })}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="font-semibold">{t("new.step3.charCount")}</span>{" "}
                    {t("new.charsCount", { n: charCount.toLocaleString() })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                {t("new.step4.title")}
              </h2>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] mb-6">
                {[
                  { label: t("new.step4.model"), value: modelLabel },
                  { label: t("new.step2.genre"), value: formData.genre || t("new.notSelected") },
                  { label: t("detail.purpose"), value: formData.purpose || t("new.noInput") },
                  { label: t("new.dataSourceCount"), value: `${sourceCount}件` },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={`px-4 py-3 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}
                  >
                    <p className="text-xs text-zinc-500 mb-1">{row.label}</p>
                    <p className="text-sm font-medium text-white">{row.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStart}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-base font-semibold text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {t("detail.processing")}
                  </>
                ) : (
                  t("new.step4.start")
                )}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className={`mt-8 flex gap-3 ${currentStep > 1 ? "justify-between" : "justify-end"}`}
          >
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-zinc-300 cursor-pointer transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.06]"
              >
                {t("new.nav.back")}
              </button>
            )}
            {currentStep < 4 && (
              <button
                onClick={handleNext}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
              >
                {t("new.nav.next")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
