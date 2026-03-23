"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerificationWidget() {
  const [activeTab, setActiveTab] = useState<"member" | "request">("member");
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleVerify = () => {
    if (!inputValue.trim()) return;
    router.push(`/verify?type=${activeTab}&id=${inputValue.trim()}`);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0px_20px_48px_-12px_rgba(0,40,38,0.12)] border border-outline-variant/20 flex flex-col gap-6">
      <div className="flex gap-4 border-b border-outline-variant/30 pb-4">
        <button
          onClick={() => { setActiveTab("member"); setInputValue(""); }}
          className={`font-bold text-lg pb-4 -mb-[17px] transition-colors border-b-2 ${activeTab === "member" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
        >
          التحقق من العضوية
        </button>
        <button
          onClick={() => { setActiveTab("request"); setInputValue(""); }}
          className={`font-bold text-lg pb-4 -mb-[17px] transition-colors border-b-2 ${activeTab === "request" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
        >
          التحقق من الطلب
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-end gap-6 pt-2">
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type={activeTab === "member" ? "text" : "text"}
            maxLength={activeTab === "member" ? 14 : 20}
            placeholder={activeTab === "member" ? "أدخل الرقم القومي الخاص بك (14 رقم)" : "أدخل رقم الطلب الخاص بك..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 text-lg font-bold tracking-widest text-left"
            dir="ltr"
          />
        </div>
        <button
          onClick={handleVerify}
          className="w-full md:w-auto px-10 py-4 bg-[#fcb900] text-on-surface hover:bg-[#e5a800] rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-md whitespace-nowrap"
        >
          تحقق الآن
        </button>
      </div>
      <p className="text-xs text-on-surface-variant font-medium">
        {activeTab === "member" ? "يمكنك التحقق من حالة عضويتك باستخدام الرقم القومي الخاص بك." : "يمكنك التحقق من حالة طلبك الخاص باستخدام رقم الطلب الذي تم تزويدك به."}
      </p>
    </div>
  );
}
