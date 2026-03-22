"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await authService.login({
        nationalId: username, // Initially testing with username field -> mapped to DB national ID or similar
        password: password
      });

      // Save token to cookies
      if (response && response.access_token) {
        Cookies.set("access_token", response.access_token, { expires: 1 }); // expires in 1 day
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setErrorMsg("بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-outline-variant/30 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-[#fcb900] to-primary"></div>
        
        {/* Main Form Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-on-surface mb-2">تسجيل دخول الموظفين</h1>
          <p className="text-sm text-on-surface-variant">الرجاء إدخال بيانات الدخول للوصول إلى لوحة التحكم.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 text-error rounded-xl text-sm font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">اسم المستخدم / البريد الإلكتروني</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">person</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم..."
                className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 text-on-surface transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-on-surface">كلمة المرور</label>
              <Link href="#" className="text-xs text-primary font-bold hover:underline">نسيت كلمة المرور؟</Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">key</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 text-on-surface transition-all outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary text-white hover:bg-primary-container disabled:opacity-70 rounded-xl font-bold text-lg transition-all shadow-md shadow-primary/20 flex justify-center items-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                جاري الدخول...
              </>
            ) : (
              "دخول"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-bold transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
