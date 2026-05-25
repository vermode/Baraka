import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Sun, Moon, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@workspace/api-client-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.46.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.96h-1.52c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12z" />
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();

  const isAr = lang === "ar";

  useEffect(() => {
    if (user) setLocation(user.role === "admin" ? "/admin" : "/app");
  }, [user, setLocation]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const handleSocial = (provider: "google" | "facebook") => {
    toast.info(
      isAr
        ? `تسجيل الدخول عبر ${provider === "google" ? "جوجل" : "فيسبوك"} قيد التفعيل. يرجى استخدام البريد الإلكتروني حالياً.`
        : `Sign in with ${provider === "google" ? "Google" : "Facebook"} is being activated. Please use email for now.`,
    );
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login.mutateAsync(data);
      toast.success(isAr ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!");
      setTimeout(() => {
        setLocation(result.role === "admin" ? "/admin" : "/app");
      }, 600);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError && err.status === 401
          ? isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password"
          : isAr ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, please try again";
      toast.error(msg);
    }
  };

  const labels = {
    heading: isAr ? "تسجيل الدخول" : "Sign In",
    sub: isAr ? "أهلاً بعودتك إلى منصة بركة" : "Welcome back to Baraka",
    emailLabel: isAr ? "البريد الإلكتروني" : "Email Address",
    emailPh: "example@email.com",
    passLabel: isAr ? "كلمة المرور" : "Password",
    passPh: isAr ? "أدخل كلمة المرور..." : "Enter your password...",
    forgot: isAr ? "نسيت كلمة المرور؟" : "Forgot password?",
    submit: isAr ? "تسجيل الدخول" : "Sign In",
    signupPrompt: isAr ? "ليس لديك حساب؟" : "Don't have an account?",
    signupLink: isAr ? "إنشاء حساب" : "Sign up",
    badge: isAr ? "آمن ومشفّر بالكامل" : "Fully secure & encrypted",
    errEmail: isAr ? "أدخل بريداً إلكترونياً" : "Enter your email",
    errPass: isAr ? "أدخل كلمة المرور" : "Enter your password",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="البركة" className="h-16 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center rounded-full bg-muted/50 p-1">
              <button onClick={() => setLang("ar")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === "ar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>عربي</button>
              <button onClick={() => setLang("en")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === "en" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>EN</button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full w-8 h-8">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40 text-muted-foreground text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {labels.badge}
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="البركة" className="h-24 w-auto object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{labels.heading}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{labels.sub}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button type="button" variant="outline" onClick={() => handleSocial("google")} className="gap-2" data-testid="btn-google">
                <GoogleIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{isAr ? "جوجل" : "Google"}</span>
              </Button>
              <Button type="button" variant="outline" onClick={() => handleSocial("facebook")} className="gap-2" data-testid="btn-facebook">
                <FacebookIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{isAr ? "فيسبوك" : "Facebook"}</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{isAr ? "أو" : "OR"}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block text-center">{labels.emailLabel}</Label>
                <Input id="email" type="email" placeholder={labels.emailPh} className={`text-center ${errors.email ? "border-destructive" : ""}`} {...register("email")} />
                {errors.email && <p className="mt-1 text-xs text-destructive text-center">{labels.errEmail}</p>}
              </div>

              <div className="mb-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block text-center">{labels.passLabel}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder={labels.passPh} className={`text-center pr-10 pl-10 ${errors.password ? "border-destructive" : ""}`} {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-destructive text-center">{labels.errPass}</p>}
              </div>

              <div className="flex justify-center mb-6">
                <button type="button" className="text-xs text-primary hover:underline font-medium">{labels.forgot}</button>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 text-base" disabled={isSubmitting || login.isPending}>
                {isSubmitting || login.isPending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    {isAr ? "جارٍ الدخول..." : "Signing in..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    {labels.submit}
                    <ArrowRight className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {labels.signupPrompt}{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">{labels.signupLink}</Link>
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        {isAr ? "© 2026 بركة. جميع الحقوق محفوظة." : "© 2026 Baraka. All rights reserved."}
      </footer>
    </div>
  );
}
