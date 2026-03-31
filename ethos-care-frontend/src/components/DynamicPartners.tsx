"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { partnersService } from "@/services/partners.service";
import { PartnerRecord } from "@/types/api";

export default function DynamicPartners() {
  const [partners, setPartners] = useState<PartnerRecord[]>([]);

  useEffect(() => {
    partnersService
      .getAll()
      .then((data) => {
        setPartners(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="py-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold font-headline text-primary mb-4">شركاء النجاح</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            نفخر بشراكتنا مع مؤسسات وهيئات تدعم رؤيتنا في تحقيق التنمية المستدامة
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 items-center opacity-70 hover:opacity-100 transition-opacity duration-300">
          {partners.length === 0 ? <p className="text-outline">لا يوجد شركاء حالياً</p> : partners.map((partner) => (
            <div key={partner.id} className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow grayscale hover:grayscale-0">
             {partner.image ? (
                <Image src={partner.image} alt={partner.name} width={160} height={160} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center px-2">
                  <span className="material-symbols-outlined text-[40px] text-outline mb-2">handshake</span>
                  <p className="text-sm font-bold text-on-surface text-center line-clamp-2">{partner.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
