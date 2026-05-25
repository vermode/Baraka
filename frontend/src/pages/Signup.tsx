import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import {
  Sun, Moon, Eye, EyeOff, ShieldCheck, ArrowRight, HandCoins, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@workspace/api-client-react";

const signupSchema = z
  .object({
    fullName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"] });

type SignupForm = z.infer<typeof signupSchema>;
type AccountType = "donor" | "charity";

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

export default function Signup() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("donor");
  const [, setLocation] = useLocation();
  const { user, signup } = useAuth();

  const isAr = lang === "ar";

  useEffect(() => {
    if (user) setLocation(user.role === "admin" ? "/admin" : "/app");
  }, [user, setLocation]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup.mutateAsync({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        accountType,
      });
      toast.success(isAr ? "تم إنشاء حسابك بنجاح!" : "Account created successfully!");
      setTimeout(() => setLocation("/app"), 500);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError && err.status === 409
          ? isAr ? "هذا البريد مسجل مسبقاً" : "Email already registered"
          : isAr ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, please try again";
      toast.error(msg);
    }
  };

  const handleSocial = (provider: "google" | "facebook") => {
    toast.info(
      isAr
        ? `تسجيل الدخول عبر ${provider === "google" ? "جوجل" : "فيسبوك"} قيد التفعيل. يرجى استخدام البريد الإلكتروني حالياً.`
        : `Sign in with ${provider === "google" ? "Google" : "Facebook"} is being activated. Please use email for now.`,
    );
  };

  const L = {
    heading: isAr ? "إنشاء حساب جديد" : "Create a New Account",
    sub: isAr ? "انضم إلى مجتمع بركة" : "Join the Baraka community",
    name: isAr ? "الاسم الكامل" : "Full Name",
    namePh: isAr ? "أدخل اسمك الكامل..." : "Enter your full name...",
    email: isAr ? "البريد الإلكتروني" : "Email Address",
    phone: isAr ? "رقم الهاتف (اختياري)" : "Phone (optional)",
    pass: isAr ? "كلمة المرور" : "Password",
    passPh: isAr ? "٦ أحرف على الأقل..." : "At least 6 characters...",
    confirm: isAr ? "تأكيد كلمة المرور" : "Confirm Password",
    submit: isAr ? "إنشاء الحساب" : "Create Account",
    loginPrompt: isAr ? "لديك حساب بالفعل؟" : "Already have an account?",
    loginLink: isAr ? "تسجيل الدخول" : "Log in",
    badge: isAr ? "آمن ومشفّر بالكامل" : "Fully secure & encrypted",
    accountTypeLabel: isAr ? "نوع الحساب" : "Account type",
    donor: isAr ? "متبرّع" : "Donor",
    donorDesc: isAr ? "أريد دعم الحالات والجمعيات" : "I want to support causes and charities",
    charity: isAr ? "جمعية خيرية" : "Charity",
    charityDesc: isAr ? "أمثّل جمعية وأريد تلقّي التبرعات" : "I represent a charity receiving donations",
    or: isAr ? "أو" : "OR",
    google: isAr ? "المتابعة عبر جوجل" : "Continue with Google",
    facebook: isAr ? "المتابعة عبر فيسبوك" : "Continue with Facebook",
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
              <button onClick={() => setLang("ar")} className={`px-3 py-1 text-xs font-medium rounded-full ${lang === "ar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>عربي</button>
              <button onClick={() => setLang("en")} className={`px-3 py-1 text-xs font-medium rounded-full ${lang === "en" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>EN</button>
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
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {L.badge}
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="البركة" className="h-24 w-auto object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{L.heading}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{L.sub}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg space-y-4">
            {/* Account type selector */}
            <div>
              <Label className="text-sm font-medium block text-center mb-2">{L.accountTypeLabel}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType("donor")}
                  data-testid="acct-donor"
                  className={`rounded-xl border p-3 text-start transition-all ${accountType === "donor" ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <HandCoins className={`h-4 w-4 ${accountType === "donor" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-bold text-sm">{L.donor}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{L.donorDesc}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("charity")}
                  data-testid="acct-charity"
                  className={`rounded-xl border p-3 text-start transition-all ${accountType === "charity" ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={`h-4 w-4 ${accountType === "charity" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-bold text-sm">{L.charity}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{L.charityDesc}</p>
                </button>
              </div>
            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => handleSocial("google")} className="gap-2" data-testid="btn-google">
                <GoogleIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{isAr ? "جوجل" : "Google"}</span>
              </Button>
              <Button type="button" variant="outline" onClick={() => handleSocial("facebook")} className="gap-2" data-testid="btn-facebook">
                <FacebookIcon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{isAr ? "فيسبوك" : "Facebook"}</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 my-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{L.or}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div>
              <Label className="text-sm font-medium block text-center mb-1.5">
                {accountType === "charity" ? (isAr ? "اسم الجمعية" : "Charity name") : L.name}
              </Label>
              <Input placeholder={L.namePh} className={`text-center ${errors.fullName ? "border-destructive" : ""}`} {...register("fullName")} />
            </div>
            <div>
              <Label className="text-sm font-medium block text-center mb-1.5">{L.email}</Label>
              <Input type="email" placeholder="example@email.com" className={`text-center ${errors.email ? "border-destructive" : ""}`} {...register("email")} />
            </div>
            <div>
              <Label className="text-sm font-medium block text-center mb-1.5">{L.phone}</Label>
              <Input type="tel" placeholder="07XXXXXXXX" className="text-center" {...register("phone")} />
            </div>
            <div>
              <Label className="text-sm font-medium block text-center mb-1.5">{L.pass}</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder={L.passPh} className={`text-center pr-10 pl-10 ${errors.password ? "border-destructive" : ""}`} {...register("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium block text-center mb-1.5">{L.confirm}</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} className={`text-center pr-10 pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`} {...register("confirmPassword")} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 text-base" disabled={isSubmitting || signup.isPending}>
              {isSubmitting || signup.isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  {isAr ? "جارٍ الإنشاء..." : "Creating..."}
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  {accountType === "charity"
                    ? (isAr ? "إنشاء حساب الجمعية" : "Create charity account")
                    : L.submit}
                  <ArrowRight className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
                </span>
              )}
            </Button>

            {accountType === "charity" && (
              <p className="text-[11px] text-center text-muted-foreground">
                {isAr
                  ? "بعد التسجيل ستتم مراجعة بيانات الجمعية من فريقنا قبل اعتمادها."
                  : "After signup, the charity's details will be reviewed by our team before activation."}
              </p>
            )}

            <p className="text-center text-sm text-muted-foreground">
              {L.loginPrompt}{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">{L.loginLink}</Link>
            </p>
          </form>
        </motion.div>
      </main>

      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        {isAr ? "© 2026 بركة. جميع الحقوق محفوظة." : "© 2026 Baraka. All rights reserved."}
      </footer>
    </div>
  );
}
