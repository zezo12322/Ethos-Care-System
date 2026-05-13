import React from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";
import type { Campaign, Program } from "@/services/cms.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ethos-care-system-production.up.railway.app/api";

async function getCmsData(): Promise<{
  campaigns: Campaign[];
  programs: Program[];
}> {
  try {
    const res = await fetch(`${API_URL}/cms/public`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    return {
      campaigns: data.campaigns ?? [],
      programs: data.programs ?? [],
    };
  } catch {
    return { campaigns: [], programs: [] };
  }
}

export default async function ServicesPage() {
  const { campaigns, programs } = await getCmsData();

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <PublicHeader />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-primary text-white py-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#fcb900]/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <span className="text-sm font-bold bg-white/10 px-4 py-1.5 rounded-full inline-block mb-4 border border-white/20">
              ط£ط¹ظ…ط§ظ„ظ†ط§ ط¹ظ„ظ‰ ط§ظ„ط£ط±ط¶
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-headline mb-6">
              ط§ظ„ط®ط¯ظ…ط§طھ ظˆط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„طھظ†ظ…ظˆظٹط©
            </h1>
            <p className="text-primary-container text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              ط¬ظ‡ظˆط¯ ظ…ط³طھظ…ط±ط© ظ„طھظˆط¸ظٹظپ ط§ظ„طھط¨ط±ط¹ط§طھ ظپظٹ ظ…ظƒط§ظ†ظ‡ط§ ط§ظ„طµط­ظٹط­ ظ„ط¨ظ†ط§ط، ط§ظ„ط¥ظ†ط³ط§ظ†
              ظˆطھظ…ظƒظٹظ†ظ‡ ظ…ظ† ط§ظ„ط¹ظٹط´ ط¨ظƒط±ط§ظ…ط© ط¹ط¨ط± ط¨ط±ط§ظ…ط¬ ظ…ط³طھط¯ط§ظ…ط© ظˆط­ظ…ظ„ط§طھ ط¯ظˆط±ظٹط©.
            </p>
          </div>
        </section>

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <section className="py-20 bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-outline-variant/20 pb-6">
                <div>
                  <h2 className="text-3xl font-bold font-headline text-on-surface mb-2">
                    ط§ظ„ط­ظ…ظ„ط§طھ ظˆط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ط¬ط§ط±ظٹط©
                  </h2>
                  <p className="text-on-surface-variant">
                    ط§ظ„ظپط±طµ ط§ظ„ظ…طھط§ط­ط© ظ„ظ„ظ…ط³ط§ظ‡ظ…ط© ظˆط§ظ„طھط¨ط±ط¹ ط§ظ„ط¢ظ† ظ„ط¯ط¹ظ… ط®ط·ط· ط§ظ„ظپط±ط¹ ط§ظ„ظ‚ط§ط¯ظ…ط©.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.map((campaign) => {
                  const percentage = campaign.target
                    ? Math.round((campaign.raised / campaign.target) * 100)
                    : 0;
                  const textColor = campaign.color.replace("bg-", "text-");

                  return (
                    <div
                      key={campaign.id}
                      className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                    >
                      <div
                        className={`${campaign.lightColor} p-8 flex items-center justify-center relative overflow-hidden`}
                      >
                        <span
                          className={`material-symbols-outlined text-[80px] ${textColor} opacity-20 transform group-hover:scale-110 transition-transform duration-500`}
                        >
                          {campaign.icon}
                        </span>
                        <div className="absolute top-4 right-4">
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            {campaign.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
                          {campaign.description}
                        </p>

                        <div className="space-y-4">
                          <div className="flex justify-between text-sm mb-1 font-bold">
                            <span className="text-on-surface-variant">ظ†ط³ط¨ط© ط§ظ„ط¥ظ†ط¬ط§ط²</span>
                            <span className={textColor} dir="ltr">
                              {percentage}%
                            </span>
                          </div>
                          <div
                            className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden flex"
                            dir="ltr"
                          >
                            <div
                              className={`h-full ${campaign.color} rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-on-surface-variant font-bold">
                            <div className="flex flex-col">
                              <span className="font-normal text-[10px]">ط§ظ„ظ‡ط¯ظپ</span>
                              <span dir="ltr">
                                {campaign.target.toLocaleString()} EGP
                              </span>
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="font-normal text-[10px]">طھظ… ط¬ظ…ط¹ظ‡</span>
                              <span dir="ltr">
                                {campaign.raised.toLocaleString()} EGP
                              </span>
                            </div>
                          </div>
                        </div>

                        <button className="w-full mt-6 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-colors">
                          طھط¨ط±ط¹ ط§ظ„ط¢ظ†
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Core Programs */}
        {programs.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold font-headline text-on-surface mb-2">
                  ط¨ط±ط§ظ…ط¬ظ†ط§ ط§ظ„ط±ط¦ظٹط³ظٹط©
                </h2>
                <div className="w-20 h-1 bg-[#fcb900] mx-auto rounded-full mt-4 mb-4"></div>
                <p className="text-on-surface-variant max-w-2xl mx-auto">
                  ظ†ظ‚ط¯ظ… ط­ط²ظ…ط© ظ…طھظƒط§ظ…ظ„ط© ظ…ظ† ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„طھظ†ظ…ظˆظٹط© ط§ظ„ظ…طµظ…ظ…ط© ظ„ط§ظ†طھط´ط§ظ„ ط§ظ„ط£ط³ط± ظ…ظ†
                  ط¯ط§ط¦ط±ط© ط§ظ„ظپظ‚ط± ظˆطھظˆظپظٹط± ط§ط­طھظٹط§ط¬ط§طھظ‡ظ… ط¨ط­ظ„ظˆظ„ ط¹ظ„ظ…ظٹط© ظ…ط¯ط±ظˆط³ط©.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {programs.map((prog) => (
                  <div
                    key={prog.id}
                    className="flex flex-col sm:flex-row gap-6 p-8 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 transition-colors"
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${prog.bg} ${prog.accent}`}
                    >
                      <span className="material-symbols-outlined text-3xl">
                        {prog.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">
                        {prog.title}
                      </h3>
                      <p className="text-on-surface-variant leading-relaxed text-sm">
                        {prog.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-[#0b2841] text-white">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-headline mb-2">
                طھط­طھط§ط¬ ط¥ظ„ظ‰ ظ…ط³ط§ط¹ط¯ط© ط£ظˆ ط¯ط¹ظ…طں
              </h2>
              <p className="text-white/70 max-w-xl">
                ط¥ط°ط§ ظƒظ†طھ ط£ظˆ ط£ظٹ ط´ط®طµ طھط¹ط±ظپظ‡ ظپظٹ ط­ط§ط¬ط© ط¥ظ„ظ‰ ط¥ط­ط¯ظ‰ ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط°ظƒظˆط±ط©طŒ
                ظٹظ…ظƒظ†ظƒ طھظ‚ط¯ظٹظ… ط·ظ„ط¨ ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظپظˆط±ط§ظ‹ ظ„ظٹظ‚ظˆظ… ظپط±ظٹظ‚ ط§ظ„ط¨ط­ط« ط§ظ„ظ…ظٹط¯ط§ظ†ظٹ
                ط¨ط²ظٹط§ط±طھظƒ ظˆطھظ‚ظٹظٹظ… ط§ظ„ط­ط§ظ„ط©.
              </p>
            </div>
            <Link
              href="/request-aid"
              className="px-8 py-4 bg-[#fcb900] text-[#0b2841] hover:bg-[#e5a800] rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined">description</span>
              طھظ‚ط¯ظٹظ… ط·ظ„ط¨ ظ…ط³ط§ط¹ط¯ط©
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

