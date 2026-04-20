"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle } from "lucide-react";
import type { Locale } from "@/i18n/translations";

const labels = {
  ja: {
    name: "お名前",
    email: "メールアドレス",
    category: "カテゴリ",
    categories: [
      "サービスに関するご質問",
      "料金・お支払いについて",
      "アカウントについて",
      "不具合の報告",
      "その他",
    ],
    message: "お問い合わせ内容",
    submit: "送信する",
    thanks: "お問い合わせありがとうございます",
    thanksDetail:
      "メールクライアントが開きます。送信ボタンを押してお問い合わせを完了してください。メールクライアントが開かない場合は、下記のメールアドレスに直接ご連絡ください。",
    directEmail: "または直接メール",
    placeholder: {
      name: "山田 太郎",
      email: "example@email.com",
      message: "お問い合わせ内容をご記入ください",
    },
  },
  en: {
    name: "Name",
    email: "Email address",
    category: "Category",
    categories: [
      "General question",
      "Pricing & payment",
      "Account",
      "Bug report",
      "Other",
    ],
    message: "Message",
    submit: "Send message",
    thanks: "Thank you for your message",
    thanksDetail:
      "Your email client will open. Press send to complete your inquiry. If your email client doesn't open, please contact us directly at the email address below.",
    directEmail: "Or email directly",
    placeholder: {
      name: "John Doe",
      email: "example@email.com",
      message: "Please describe your inquiry",
    },
  },
};

export function ContactForm({ locale }: { locale: Locale }) {
  const [submitted, setSubmitted] = useState(false);
  const l = labels[locale];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const category = fd.get("category") as string;
    const message = fd.get("message") as string;

    const subject = encodeURIComponent(`[${category}] ${name}`);
    const body = encodeURIComponent(
      `${locale === "ja" ? "名前" : "Name"}: ${name}\n${locale === "ja" ? "メール" : "Email"}: ${email}\n${locale === "ja" ? "カテゴリ" : "Category"}: ${category}\n\n${message}`
    );
    window.location.href = `mailto:contact@ai-rakuraku.jp?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center sm:p-12">
        <CheckCircle size={40} className="mx-auto text-emerald-400" />
        <h3 className="mt-4 text-lg font-semibold text-white">{l.thanks}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {l.thanksDetail}
        </p>
        <div className="mt-6 text-sm text-zinc-500">
          {l.directEmail}:{" "}
          <a
            href="mailto:contact@ai-rakuraku.jp"
            className="text-blue-400 underline underline-offset-2 cursor-pointer"
          >
            contact@ai-rakuraku.jp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          {l.name}
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder={l.placeholder.name}
          className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          {l.email}
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder={l.placeholder.email}
          className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          {l.category}
        </label>
        <select
          name="category"
          required
          className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition-colors cursor-pointer focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
        >
          {l.categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300">
          {l.message}
        </label>
        <textarea
          name="message"
          required
          rows={6}
          placeholder={l.placeholder.message}
          className="mt-1.5 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
        />
      </div>
      <button
        type="submit"
        className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:brightness-110"
      >
        <Send size={15} />
        {l.submit}
      </button>
    </form>
  );
}
