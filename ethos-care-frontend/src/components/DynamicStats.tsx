"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DynamicStats() {
  const [stats, setStats] = useState({ families: 1500, locations: 50, volunteers: 2500 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/stats");
        if (res.data?.public) {
          setStats({
            families: res.data.public.families > 0 ? res.data.public.families : 150,
            locations: res.data.public.locations > 0 ? res.data.public.locations : 12,
            volunteers: res.data.public.volunteers > 0 ? res.data.public.volunteers : 45
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="py-12 border-b border-outline-variant/10">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-outline-variant/20">
        <div className="p-4">
          <h3 className="text-5xl font-extrabold font-headline text-primary mb-2">+{stats.families}</h3>
          <p className="text-lg font-bold text-on-surface">أسرة مستفيدة</p>
          <p className="text-sm text-on-surface-variant mt-2 font-medium">تم التحقق منها ودعمها</p>
        </div>
        <div className="p-4">
          <h3 className="text-5xl font-extrabold font-headline text-secondary mb-2">+{stats.locations}</h3>
          <p className="text-lg font-bold text-on-surface">قرية نغطيها</p>
          <p className="text-sm text-on-surface-variant mt-2 font-medium">في مراكز بني سويف</p>
        </div>
        <div className="p-4">
          <h3 className="text-5xl font-extrabold font-headline text-tertiary mb-2">+{stats.volunteers}</h3>
          <p className="text-lg font-bold text-on-surface">متطوع ميداني</p>
          <p className="text-sm text-on-surface-variant mt-2 font-medium">جاهزين للتدخل السريع</p>
        </div>
      </div>
    </section>
  );
}
