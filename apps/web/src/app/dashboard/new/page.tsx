"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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

const GENRES = [
  "カスタマーサポート",
  "社内ナレッジ",
  "文章作成・要約",
  "プログラミング補助",
  "教育・学習支援",
  "その他",
];

const STEP_LABELS = ["モデル選択", "用途設定", "データ入力", "確認・開始"];

export default function NewProjectPage() {
  const router = useRouter();
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
        alert(`${file.name} は5MBを超えています`);
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
      alert("エラーが発生しました。もう一度お試しください。");
      setIsLoading(false);
    }
  };

  const sourceCount = formData.urls.length + formData.files.length;
  const modelLabel =
    formData.modelType === "qwen2.5-1.5b"
      ? "高速（軽量）- Qwen2.5 1.5B"
      : formData.modelType === "qwen2.5-3b"
      ? "標準（高品質）- Qwen2.5 3B"
      : formData.modelType === "gemma-4-e2b"
      ? "Google Gemma 4 E2B（軽量）"
      : "Google Gemma 4 E4B（高品質）";

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Back to Dashboard Link */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "var(--color-link)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            ← ダッシュボードに戻る
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                style={{ display: "flex", alignItems: "center", flex: step < 4 ? 1 : "none" }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    flexShrink: 0,
                    background:
                      step <= currentStep
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                    color:
                      step <= currentStep
                        ? "#fff"
                        : "var(--color-text-secondary)",
                    transition: "background 0.2s",
                  }}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      margin: "0 0.5rem",
                      background:
                        step < currentStep
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                      transition: "background 0.2s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "0px",
            }}
          >
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                style={{
                  fontSize: "0.75rem",
                  color:
                    i + 1 === currentStep
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)",
                  fontWeight: i + 1 === currentStep ? 500 : 400,
                  width: i < 3 ? "calc(25% - 0.25rem)" : "auto",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Card Container */}
        <div className="card-apple">
          {/* Step 1: Model Selection */}
          {currentStep === 1 && (
            <div>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                ステップ1: モデル選択
              </h2>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  学習に使用するモデルを選択してください
                </label>
                <select
                  value={formData.modelType}
                  onChange={handleModelChange}
                  className="input-apple"
                  style={{ width: "100%" }}
                >
                  <option value="qwen2.5-1.5b">高速（軽量）- Qwen2.5 1.5B</option>
                  <option value="qwen2.5-3b">標準（高品質）- Qwen2.5 3B</option>
                  <option value="gemma-4-e2b">Google Gemma 4 E2B（軽量）</option>
                  <option value="gemma-4-e4b">Google Gemma 4 E4B（高品質）</option>
                </select>
                <p
                  className="text-caption"
                  style={{
                    color: "var(--color-text-secondary)",
                    marginTop: "0.75rem",
                  }}
                >
                  {formData.modelType === "qwen2.5-1.5b"
                    ? "軽量モデルは高速に学習できますが、精度は標準モデルより低い場合があります。日本語性能に強みがあります。"
                    : formData.modelType === "qwen2.5-3b"
                    ? "標準モデルは高品質な学習が期待できます。日本語性能に強みがあります。学習時間が少し長くなります。"
                    : formData.modelType === "gemma-4-e2b"
                    ? "Gemma 4 E2B はGoogle製の最新軽量モデルです。2Bパラメータ相当で高速に学習できます。"
                    : "Gemma 4 E4B はGoogle製の最新高品質モデルです。4Bパラメータ相当で、より精度の高い学習が期待できます。"}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Usage Setting */}
          {currentStep === 2 && (
            <div>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                ステップ2: 用途設定
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Genre Selection */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ジャンルを選択
                  </label>
                  <select
                    value={formData.genre}
                    onChange={handleGenreChange}
                    className="input-apple"
                    style={{ width: "100%" }}
                  >
                    <option value="">選択してください</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Purpose Input */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    用途説明（任意）
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={handlePurposeChange}
                    placeholder="例：ECサイトの問い合わせ対応用"
                    rows={4}
                    className="input-apple"
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data Input */}
          {currentStep === 3 && (
            <div>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                ステップ3: データ入力
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* URL Input */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    URLを追加（最大5件）
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com"
                      onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
                      className="input-apple"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={handleAddUrl}
                      disabled={!newUrl.trim() || formData.urls.length >= 5}
                      className="btn-primary"
                      style={{
                        padding: "0 1rem",
                        opacity: !newUrl.trim() || formData.urls.length >= 5 ? 0.4 : 1,
                        cursor: !newUrl.trim() || formData.urls.length >= 5 ? "not-allowed" : "pointer",
                      }}
                    >
                      追加
                    </button>
                  </div>
                  {formData.urls.length > 0 && (
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {formData.urls.map((url, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--color-bg)",
                            padding: "0.625rem 0.875rem",
                            borderRadius: 8,
                            fontSize: "0.875rem",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--color-text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              flex: 1,
                              marginRight: "0.75rem",
                            }}
                          >
                            {url}
                          </span>
                          <button
                            onClick={() => handleRemoveUrl(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: "var(--color-error)",
                              fontSize: "0.8125rem",
                              fontWeight: 500,
                              flexShrink: 0,
                            }}
                          >
                            削除
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ファイルをアップロード（.txt/.pdf/.csv/.json、最大5件）
                  </label>
                  <div
                    style={{
                      border: "2px dashed var(--color-border)",
                      borderRadius: 12,
                      padding: "1.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--color-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <input
                      type="file"
                      multiple
                      accept=".txt,.pdf,.csv,.json"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      id="fileInput"
                    />
                    <label htmlFor="fileInput" style={{ cursor: "pointer", display: "block" }}>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        ドラッグ&ドロップまたはクリック
                      </p>
                      <p
                        className="text-caption"
                        style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}
                      >
                        対応形式: .txt, .pdf, .csv, .json
                      </p>
                    </label>
                  </div>
                  {formData.files.length > 0 && (
                    <ul
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      {formData.files.map((file, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--color-bg)",
                            padding: "0.625rem 0.875rem",
                            borderRadius: 8,
                            fontSize: "0.875rem",
                          }}
                        >
                          <span style={{ color: "var(--color-text-primary)" }}>
                            {file.name}
                          </span>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: "var(--color-error)",
                              fontSize: "0.8125rem",
                              fontWeight: 500,
                              flexShrink: 0,
                              marginLeft: "0.75rem",
                            }}
                          >
                            削除
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Counter */}
                <div
                  style={{
                    background: "var(--color-bg)",
                    borderRadius: 10,
                    padding: "1rem 1.25rem",
                  }}
                >
                  <p
                    className="text-caption"
                    style={{ color: "var(--color-text-primary)", marginBottom: "0.25rem" }}
                  >
                    <span style={{ fontWeight: 600 }}>追加済みソース:</span>{" "}
                    {sourceCount}件 / 5件
                  </p>
                  <p
                    className="text-caption"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    <span style={{ fontWeight: 600 }}>推定文字数:</span>{" "}
                    {charCount.toLocaleString()}文字 / 500,000文字
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                ステップ4: 確認・開始
              </h2>

              <div
                style={{
                  background: "var(--color-bg)",
                  borderRadius: 10,
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  display: "grid",
                  gap: 0,
                }}
              >
                {[
                  { label: "モデル", value: modelLabel },
                  { label: "ジャンル", value: formData.genre || "未選択" },
                  { label: "用途説明", value: formData.purpose || "入力なし" },
                  { label: "データソース数", value: `${sourceCount}件` },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      padding: "0.875rem 0",
                      borderTop: i > 0 ? "1px solid var(--color-border)" : "none",
                    }}
                  >
                    <p
                      className="text-caption"
                      style={{ color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}
                    >
                      {row.label}
                    </p>
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStart}
                disabled={isLoading}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "0.875rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-apple" />
                    処理中...
                  </>
                ) : (
                  "学習を開始する（770円・税込）"
                )}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: currentStep > 1 ? "space-between" : "flex-end",
            }}
          >
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                戻る
              </button>
            )}
            {currentStep < 4 && (
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
