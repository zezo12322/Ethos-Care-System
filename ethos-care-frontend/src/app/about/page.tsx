import React from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ethos-care-system-production.up.railway.app/api";

async function getCmsContent(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_URL}/cms/public`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    return data.content ?? {};
  } catch {
    return {};
  }
}

export default async function AboutPage() {
  const content = await getCmsContent();

  const c = (key: string, fallback: string) => content[key] ?? fallback;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <PublicHeader />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-primary text-white py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl font-bold font-headline mb-4">ظ…ظ† ظ†ط­ظ†</h1>
            <p className="text-primary-container text-lg max-w-2xl mx-auto">
              {c("about_intro", "ط¬ظ…ط¹ظٹط© ط£ط¬ظٹط§ظ„ طµظ†ط§ط¹ ط§ظ„ط­ظٹط§ط©طŒ ظ…ط¤ط³ط³ط© ط£ظ‡ظ„ظٹط© ظˆط·ظ†ظٹط© ط؛ظٹط± ظ‡ط§ط¯ظپط© ظ„ظ„ط±ط¨ط­طŒ طھط¹ظ…ظ„ ظپظٹ ظ…ط¬ط§ظ„ ط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط¬طھظ…ط¹ظٹط© ظˆطھط¹ط¨ط¦ط© ط·ط§ظ‚ط§طھ ط§ظ„ط´ط¨ط§ط¨ ظ†ط­ظˆ ط§ظ„ط¹ظ…ظ„ ط§ظ„طھط·ظˆط¹ظٹ.")}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 relative bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold font-headline text-on-surface mb-4">ظ†ط³ط¹ظ‰ ظ„ط¨ظ†ط§ط، ط¥ظ†ط³ط§ظ† ط·ظ…ظˆط­ ظˆظ…ط¬طھظ…ط¹ ظ…طھظƒط§ظپظ„</h2>
                <div className="w-16 h-1.5 bg-[#fcb900] rounded-full mb-6"></div>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  ظپظٹ ظپط±ط¹ظ†ط§ ط¨ظ…ط­ط§ظپط¸ط© ط¨ظ†ظٹ ط³ظˆظٹظپطŒ ظ†ط¹ظ…ظ„ ط¬ط§ظ‡ط¯ظٹظ† ظ„ظ„ظˆطµظˆظ„ ط¥ظ„ظ‰ ط§ظ„ط£ط³ط± ط§ظ„ط£ظƒط«ط± ط§ط­طھظٹط§ط¬ط§ظ‹ ظپظٹ ظ‚ط±ظ‰ ظˆظ…ط±ط§ظƒط² ط§ظ„ظ…ط­ط§ظپط¸ط©طŒ ظˆطھظ‚ط¯ظٹظ… ط§ظ„ط¯ط¹ظ… ط§ظ„ظ…ط¨ط§ط´ط± ظˆظ…ط´ط§ط±ظٹط¹ ط§ظ„طھظ…ظƒظٹظ† ط§ظ„ط§ظ‚طھطµط§ط¯ظٹطŒ ظ…ط¹طھظ…ط¯ظٹظ† ط¹ظ„ظ‰ ظƒظˆط§ط¯ط±ظ†ط§ ط§ظ„ط´ط§ط¨ط© ظ…ظ† ط§ظ„ظ…طھط·ظˆط¹ظٹظ† ط§ظ„ظ…ط®ظ„طµظٹظ†.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">visibility</span>
                  </div>
                  <h3 className="font-bold font-headline text-xl mb-2">ط±ط¤ظٹطھظ†ط§</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {c("about_vision", "ط£ظ† ظ†ظƒظˆظ† ط§ظ„ظ…ط¤ط³ط³ط© ط§ظ„ط±ط§ط¦ط¯ط© ظپظٹ ط¨ظ†ط§ط، ظ‚ط¯ط±ط§طھ ط§ظ„ط´ط¨ط§ط¨ ظˆط¥ط­ط¯ط§ط« ط£ط«ط± ط¥ظٹط¬ط§ط¨ظٹ ظˆطھظ†ظ…ظٹط© ظ…ط³طھط¯ط§ظ…ط© ظپظٹ ط§ظ„ظ…ط¬طھظ…ط¹ ط§ظ„ظ…طµط±ظٹ.")}
                  </p>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
                  <div className="w-12 h-12 bg-[#fcb900]/10 text-[#a37600] rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">flag</span>
                  </div>
                  <h3 className="font-bold font-headline text-xl mb-2">ط±ط³ط§ظ„طھظ†ط§</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {c("about_mission", "طھط­ظپظٹط² ط§ظ„ط¹ظ…ظ„ ط§ظ„طھط·ظˆط¹ظٹطŒ ظˆطھظ…ظƒظٹظ† ط§ظ„ظپط¦ط§طھ ط§ظ„ظ…ظ‡ظ…ط´ط© ظ…ظ† ط®ظ„ط§ظ„ ط¨ط±ط§ظ…ط¬ طھظ†ظ…ظˆظٹط© ظˆظ…ط³ط§ط¹ط¯ط§طھ ظپط¹ظ‘ط§ظ„ط© طھط¶ظ…ظ† ط­ظٹط§ط© ظƒط±ظٹظ…ط© ظˆظ…ط³طھظ‚ظ„ط©.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-surface-container-low rounded-full absolute -top-10 -right-10 w-64 h-64 -z-10"></div>
              <div className="bg-gradient-to-tr from-primary/20 to-surface-container rounded-3xl overflow-hidden aspect-[4/3] border-8 border-white shadow-2xl relative flex items-center justify-center">
                 <span className="material-symbols-outlined text-[100px] text-primary/30">diversity_3</span>
                 <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm text-center">
                    <p className="font-bold text-primary font-headline">
                      ط£ظƒط«ط± ظ…ظ† {c("about_years", "15")} ط¹ط§ظ…ط§ظ‹ ظ…ظ† ط§ظ„ط¹ط·ط§ط،
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-surface-container-lowest border-t border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-4">ط§ظ„ظ‚ظٹظ… ط§ظ„طھظٹ طھط­ط±ظƒظ†ط§</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                ظ†ط³طھظ…ط¯ ظ‚ظˆطھظ†ط§ ظ…ظ† ظ…ط¬ظ…ظˆط¹ط© ظ…ظ† ط§ظ„ظ…ط¨ط§ط¯ط¦ ط§ظ„ط±ط§ط³ط®ط© ط§ظ„طھظٹ طھط­ظƒظ… ظƒط§ظپط© ط£ظ†ط´ط·طھظ†ط§ ط§ظ„طھظ†ظ…ظˆظٹط© ظˆطھط¹ط§ظ…ظ„ظ†ط§ ظ…ط¹ ط§ظ„ظ…ط³طھظپظٹط¯ظٹظ† ظˆط§ظ„ط´ط±ظƒط§ط،.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">handshake</span>
                </div>
                <h3 className="font-bold text-xl mb-3">{c("value1_title", "ط§ظ„طھط·ظˆط¹ ظˆط§ظ„ط¹ط·ط§ط،")}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{c("value1_body", "ظ†ط¤ظ…ظ† ط¨ط£ظ† ظƒظ„ ط¬ظ‡ط¯ ظٹظ‚ط¯ظ…ظ‡ ط§ظ„ط´ط¨ط§ط¨ ظ‚ط§ط¯ط± ط¹ظ„ظ‰ طھط؛ظٹظٹط± ط­ظٹط§ط© ط§ظ„ظƒط«ظٹط±ظٹظ†طŒ ظˆط£ظ† ط§ظ„طھط·ظˆط¹ ظ‡ظˆ ط§ظ„ظ…ط­ط±ظƒ ط§ظ„ط£ط³ط§ط³ظٹ ظ„ظ†ظ‡ط¶ط© ط§ظ„ط£ظ…ظ….")}</p>
              </div>

              <div className="text-center p-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <h3 className="font-bold text-xl mb-3">{c("value2_title", "ط§ظ„ط´ظپط§ظپظٹط© ظˆط§ظ„ط£ظ…ط§ظ†ط©")}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{c("value2_body", "ظ†ظ„طھط²ظ… ط¨ط§ظ„ط´ظپط§ظپظٹط© ط§ظ„ظ…ط·ظ„ظ‚ط© ظپظٹ طھظˆط¬ظٹظ‡ ط£ظ…ظˆط§ظ„ ط§ظ„ظ…طھط¨ط±ط¹ظٹظ† ظˆظˆطµظˆظ„ ط§ظ„ظ…ط³ط§ط¹ط¯ط§طھ ظ„ظ…ط³طھط­ظ‚ظٹظ‡ط§ ط¨ظ†ط§ط،ظ‹ ط¹ظ„ظ‰ ط¨ط­ظˆط« ظ…ظٹط¯ط§ظ†ظٹط© ط¯ظ‚ظٹظ‚ط©.")}</p>
              </div>

              <div className="text-center p-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">trending_up</span>
                </div>
                <h3 className="font-bold text-xl mb-3">{c("value3_title", "ط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©")}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{c("value3_body", "ظ„ط§ ظ†ظƒطھظپظٹ ط¨طھظ‚ط¯ظٹظ… ط§ظ„ظ…ط³ط§ط¹ط¯ط§طھ ط§ظ„ط¹ط§ط¬ظ„ط©طŒ ط¨ظ„ ظ†ط³ط¹ظ‰ ظ„طھظ…ظƒظٹظ† ط§ظ„ط£ط³ط± ط§ظ‚طھطµط§ط¯ظٹط§ظ‹ ط¹ط¨ط± ظ…ط´ط§ط±ظٹط¹ طµط؛ظٹط±ط© طھط¶ظ…ظ† ظ„ظ‡ظ… ط¯ط®ظ„ط§ظ‹ ط«ط§ط¨طھط§ظ‹.")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Details */}
        <section className="py-20 bg-white" id="registration">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-4">ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط³ط¬ظٹظ„ظٹط© ط§ظ„ط±ط³ظ…ظٹط©</h2>
              <div className="w-16 h-1.5 bg-[#fcb900] rounded-full mx-auto mb-4"></div>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                ط¬ظ…ط¹ظٹط© ظ…ط±ط®طµط© ظˆظ…ط³ط¬ظ„ط© ط±ط³ظ…ظٹط§ظ‹ ظ„ط¯ظ‰ ظˆط²ط§ط±ط© ط§ظ„طھط¶ط§ظ…ظ† ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹ - ط¬ظ…ظ‡ظˆط±ظٹط© ظ…طµط± ط§ظ„ط¹ط±ط¨ظٹط©
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-primary px-8 py-5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-white text-2xl">verified</span>
                  <h3 className="font-bold text-white text-xl font-headline">ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط³ط¬ظٹظ„ ظˆط§ظ„طھط±ط®ظٹطµ</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-outline-variant/20">
                  <div className="p-8 space-y-6">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">ط§ظ„ط§ط³ظ… ط§ظ„ط±ط³ظ…ظٹ</p>
                      <p className="font-bold text-on-surface text-lg">{c("reg_name", "ط¬ظ…ط¹ظٹط© ط£ط¬ظٹط§ظ„ طµظ†ط§ط¹ ط§ظ„ط­ظٹط§ط© ظ„ظ„طھظ†ظ…ظٹط© ط¨ط¨ظ†ظٹ ط³ظˆظٹظپ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">ط±ظ‚ظ… ط§ظ„ظ‚ظٹط¯</p>
                      <p className="font-bold text-primary text-2xl font-mono">{c("reg_number", "1880")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">ط³ظ†ط© ط§ظ„ظ‚ظٹط¯</p>
                      <p className="font-bold text-on-surface">{c("reg_year", "2013")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">طھط§ط±ظٹط® ط§ظ„ظ‚ظٹط¯</p>
                      <p className="font-bold text-on-surface" dir="ltr">{c("reg_date", "29 / 07 / 2012")}</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">ط§ظ„ط¬ظ‡ط© ط§ظ„ظ…ط³ط¬ظ„ط©</p>
                      <p className="font-bold text-on-surface">{c("reg_authority", "ظ…ط¯ظٹط±ظٹط© ط§ظ„طھط¶ط§ظ…ظ† ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹ - ط¨ظ†ظٹ ط³ظˆظٹظپ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">ظƒظˆط¯ ط§ظ„ظ†ط´ط§ط· ط§ظ„ط¶ط±ظٹط¨ظٹ</p>
                      <p className="font-bold text-on-surface font-mono">{c("tax_code", "9609")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">ط§ظ„ط±ظ‚ظ… ط§ظ„ط¶ط±ظٹط¨ظٹ</p>
                      <p className="font-bold text-on-surface font-mono" dir="ltr">{c("tax_number", "266-144-626-765-492")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط±ط³ظ…ظٹ</p>
                      <p className="font-bold text-primary" dir="ltr">{c("contact_website", "lifemakers-bns.com")}</p>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 bg-green-50 border-t border-outline-variant/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                  <p className="text-sm text-green-800 font-medium">
                    ظ…ط³ط¬ظ„ط© ظˆظ…ط±ط®طµط© ظˆظپظ‚ط§ظ‹ ظ„ط£ط­ظƒط§ظ… ط§ظ„ظ‚ط§ظ†ظˆظ† ط±ظ‚ظ… 149 ظ„ط³ظ†ط© 2019 ظˆظ„ط§ط¦ط­طھظ‡ ط§ظ„طھظ†ظپظٹط°ظٹط©
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-surface-container-lowest border-t border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold font-headline text-on-surface mb-8">ظپط±ظٹظ‚ ط§ظ„ط¹ظ…ظ„ (ط¨ظ†ظٹ ط³ظˆظٹظپ)</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg mb-12">
              ظ†ظپط®ط± ط¨ط§ظ…طھظ„ط§ظƒظ†ط§ ط£ظƒط¨ط± ظ‚ظˆط© طھط·ظˆط¹ظٹط© ظ…ظ†ط¸ظ…ط© ظˆظ…ظڈط¯ط±ط¨ط© ظ„ظ„طھط¹ط§ظ…ظ„ ظ…ط¹ ط¯ط±ط§ط³ط§طھ ط§ظ„ط­ط§ظ„ط© ظˆطھظ†ط¸ظٹظ… ط§ظ„ظ‚ظˆط§ظپظ„ ط§ظ„ط·ط¨ظٹط© ظˆط§ظ„طھظ†ظ…ظˆظٹط© ط¨ط¬ظ…ظٹط¹ ط£ظ†ط­ط§ط، ط§ظ„ظ…ط­ط§ظپط¸ط©.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="px-8 py-3 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-colors">
                ط§ظ†ط¶ظ… ظ„ظپط±ظٹظ‚ظ†ط§ ط§ظ„طھط·ظˆط¹ظٹ
              </Link>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
