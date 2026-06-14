import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Sun, Moon, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { notifyError, notifySuccess } from "@/lib/errors";
import { EmailField } from "@/components/auth/EmailField";

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
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login.mutateAsync(data);
      notifySuccess(isAr ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!");
      setTimeout(() => {
        setLocation(result.role === "admin" ? "/admin" : "/app");
      }, 600);
    } catch (err: unknown) {
      notifyError(err, lang, {
        401: {
          ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          en: "Invalid email or password.",
        },
      });
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
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block text-start">{labels.emailLabel}</Label>
                <Controller
                  control={control}
                  name="email"
                  defaultValue=""
                  render={({ field }) => (
                    <EmailField
                      id="email"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      isAr={isAr}
                      placeholder={labels.emailPh}
                      hasError={!!errors.email}
                    />
                  )}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive text-start">{labels.errEmail}</p>}
              </div>

              <div className="mb-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block text-start">{labels.passLabel}</Label>
                <div className="relative" dir="ltr">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder={labels.passPh} className={`text-start pe-10 ${errors.password ? "border-destructive" : ""}`} {...register("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={isAr ? "إظهار كلمة المرور" : "Show password"} className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-destructive text-start">{labels.errPass}</p>}
              </div>

              <div className="flex justify-end mb-6">
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
