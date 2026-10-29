import { redirect } from "next/navigation";

// الحالات أصبحت جزءًا من ملف الأسرة — القائمة الرئيسية هي الأسر
export default function CasesPage() {
  redirect("/dashboard/families");
}
