import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-url";

// «تطوع معنا» يفتح واتساب على الرقم المحفوظ في CMS (مفتاح volunteer_whatsapp)
const FALLBACK_WHATSAPP = "201026236435";
const MESSAGE = "السلام عليكم، أرغب في التطوع مع صناع الحياة ببني سويف";

async function getWhatsappNumber() {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/public`, { next: { revalidate: 300 } });
    if (!res.ok) return FALLBACK_WHATSAPP;
    const data = await res.json();
    const digits = String(data.content?.volunteer_whatsapp ?? "").replace(/\D/g, "");
    return digits || FALLBACK_WHATSAPP;
  } catch {
    return FALLBACK_WHATSAPP;
  }
}

export default async function VolunteerPage() {
  redirect(`https://wa.me/${await getWhatsappNumber()}?text=${encodeURIComponent(MESSAGE)}`);
}
