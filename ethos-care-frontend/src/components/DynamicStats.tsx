"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface PublicStats {
  families: number;
  locations: number;
  volunteers: number;
}

export default function DynamicStats() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/stats/public")
      .then((res) => {
        if (!cancelled && res.data) {
          setStats({
            families: res.data.families ?? 0,
            locations: res.data.locations ?? 0,
            volunteers: res.data.volunteers ?? 0,
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    {
      key: "families",
      value: stats?.families,
      color: "text-primary",
      title: "أسرة مستفيدة",
      sub: "تم التحقق منها ودعمها",
    },
    {
      key: "locations",
      value: stats?.locations,
      color: "text-warning",
      title: "قرية نغطيها",
      sub: "في مراكز بني سويف",
    },
    {
      key: "volunteers",
      value: stats?.volunteers,
      color: "text-tertiary",
      title: "متطوع ميداني",
      sub: "جاهزين للتدخل السريع",
    },
  ];

  return (
    <section className="py-12 border-b border-outline-variant/10">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-outline-variant/20">
        {items.map((item) => (
          <div key={item.key} className="p-4">
            <h3 className={`text-5xl font-extrabold font-headline ${item.color} mb-2`}>
              {item.value === undefined ? (
                <span
                  className="inline-block h-12 w-28 rounded-xl bg-surface-container animate-pulse align-middle"
                  aria-hidden="true"
                />
              ) : (
                `+${item.value.toLocaleString("ar-EG")}`
              )}
            </h3>
            <p className="text-lg font-bold text-on-surface">{item.title}</p>
            <p className="text-sm text-on-surface-variant mt-2 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
