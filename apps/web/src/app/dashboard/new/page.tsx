"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

type Step = 1 | 2 | 3 | 4;

type ModelType = "qwen2.5-1.5b" | "qwen2.5-3b" | "gemma-3n-e2b" | "gemma-3n-e4b";

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

      // ファイル内容を並列で読み取る
      const readPromises = validFiles.map((file) =>
        new Promise<FileContent>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({ name: file.name, content: event.target?.result as string });
          };
          reader.readAsText(file);
        })
      );
      const newContents = await Promise.all(readPromises);
      setFileContents((prev) => {
        const updated = [...prev, ...newContents];
        setCharCount(updated.reduce((acc, fc) => acc + fc.content.length, 0));
        return updated;
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    const newFileContents = fileContents.filter((_, i) => i !== index);
    setFormData({ ...formData, files: newFiles });
    setFileContents(newFileContents);
    const totalChars = newFileContents.reduce((acc, fc) => acc + fc.content.length, 0);
    setCharCount(totalChars);
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
      const sourcePromises: Promise<unknown>[] = [];
      for (const url of formData.urls) {
        sourcePromises.push(api.addSource(project.id, {
          type: "url",
          name: url,
          content: url,
        }));
      }
      for (let i = 0; i < formData.files.length; i++) {
        const fileContent = fileContents[i];
        if (fileContent) {
          sourcePromises.push(api.addSource(project.id, {
            type: "file",
            name: fileContent.name,
            content: fileContent.content,
          }));
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
      : "標準（高品質）- Qwen2.5 3B";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back to Dashboard Link */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← ダッシュボードに戻る
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step <= currentStep
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      step < currentStep ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>モデル選択</span>
            <span>用途設定</span>
            <span>データ入力</span>
            <span>確認・開始</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Model Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ステップ1: モデル選択
              </h2>
              <div className="space-y-4">
                <label className="block text-gray-900 font-medium mb-2">
                  学習に使用するモデルを選択してください
                </label>
                <select
                  value={formData.modelType}
                  onChange={handleModelChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="qwen2.5-1.5b">高速（軽量）- Qwen2.5 1.5B</option>
                  <option value="qwen2.5-3b">標準（高品質）- Qwen2.5 3B</option>
                  <option value="gemma-3n-e2b">マルチモーダル軽量 - Gemma 3n E2B</option>
                  <option value="gemma-3n-e4b">マルチモーダル標準 - Gemma 3n E4B</option>
                </select>
                <p className="text-sm text-gray-700 mt-3">
                  {formData.modelType === "qwen2.5-1.5b"
                    ? "軽量モデルは高速に学習できますが、精度は標準モデルより低い場合があります。日本語性能に強みがあります。"
                    : formData.modelType === "qwen2.5-3b"
                    ? "標準モデルは高品質な学習が期待できます。日本語性能に強みがあります。学習時間が少し長くなります。"
                    : formData.modelType === "gemma-3n-e2b"
                    ? "Gemma 3n E2B はGoogle製の軽量モデルです。マルチモーダル対応・多言語対応が特徴です。"
                    : "Gemma 3n E4B はGoogle製の高品質モデルです。マルチモーダル対応・多言語対応が特徴で、より精度が高くなります。"}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Usage Setting */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ステップ2: 用途設定
              </h2>
              <div className="space-y-6">
                {/* Genre Selection */}
                <div>
                  <label className="block text-gray-900 font-medium mb-2">
                    ジャンルを選択
                  </label>
                  <select
                    value={formData.genre}
                    onChange={handleGenreChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
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
                  <label className="block text-gray-900 font-medium mb-2">
                    用途説明（任意）
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={handlePurposeChange}
                    placeholder="例：ECサイトの問い合わせ対応用"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data Input */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ステップ3: データ入力
              </h2>
              <div className="space-y-6">
                {/* URL Input */}
                <div>
                  <label className="block text-gray-900 font-medium mb-2">
                    URLを追加（最大5件）
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com"
                      onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder:text-gray-500"
                    />
                    <button
                      onClick={handleAddUrl}
                      disabled={!newUrl.trim() || formData.urls.length >= 5}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
                    >
                      追加
                    </button>
                  </div>
                  {formData.urls.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {formData.urls.map((url, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
                        >
                          <span className="text-gray-700 truncate">{url}</span>
                          <button
                            onClick={() => handleRemoveUrl(idx)}
                            className="text-red-600 hover:text-red-800 font-medium"
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
                  <label className="block text-gray-900 font-medium mb-2">
                    ファイルをアップロード（.txt/.pdf/.csv/.json、最大5件）
                  </label>
                  <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center cursor-pointer hover:bg-indigo-50 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".txt,.pdf,.csv,.json"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileInput"
                    />
                    <label
                      htmlFor="fileInput"
                      className="cursor-pointer block"
                    >
                      <p className="text-gray-700 font-medium">
                        ドラッグ&ドロップまたはクリック
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        対応形式: .txt, .pdf, .csv, .json
                      </p>
                    </label>
                  </div>
                  {formData.files.length > 0 && (
                    <ul className="space-y-2 mt-4">
                      {formData.files.map((file, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
                        >
                          <span className="text-gray-700">{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            削除
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Counter */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">追加済みソース:</span>{" "}
                    {sourceCount}件 / 5件
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">推定文字数:</span>{" "}
                    {charCount.toLocaleString()}文字 / 500,000文字
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ステップ4: 確認・開始
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">モデル</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {modelLabel}
                  </p>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-sm text-gray-600">ジャンル</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.genre || "未選択"}
                  </p>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-sm text-gray-600">用途説明</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.purpose || "入力なし"}
                  </p>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-sm text-gray-600">データソース数</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {sourceCount}件
                  </p>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg font-bold text-lg mb-4 transition-colors flex items-center justify-center gap-2 ${
                  isLoading
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    処理中...
                  </>
                ) : (
                  "学習を開始する（770円・税込）"
                )}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                戻る
              </button>
            )}
            {currentStep < 4 && (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
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
