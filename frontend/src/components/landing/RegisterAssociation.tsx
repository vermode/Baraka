import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Star, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { notifyError, notifySuccess } from "@/lib/errors";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCreateRegistrationRequest } from "@workspace/api-client-react";

const formSchema = z.object({
  orgName: z.string().min(2, "مطلوب"),
  governorate: z.string().min(1, "مطلوب"),
  category: z.string().min(1, "مطلوب"),
  regNumber: z.string().optional(),
  about: z.string().min(10, "يرجى كتابة نبذة تفصيلية"),
  contactName: z.string().min(2, "مطلوب"),
  contactPhone: z.string().min(10, "رقم هاتف غير صحيح"),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal('')),
});

export function RegisterAssociation() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [submitted, setSubmitted] = useState(false);
  const mutation = useCreateRegistrationRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgName: "",
      governorate: "",
      category: "",
      regNumber: "",
      about: "",
      contactName: "",
      contactPhone: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await mutation.mutateAsync({
        data: {
          orgName: values.orgName,
          governorate: values.governorate,
          category: values.category,
          regNumber: values.regNumber || undefined,
          about: values.about,
          contactName: values.contactName,
          contactPhone: values.contactPhone,
          email: values.email || undefined,
        },
      });
      notifySuccess(t('reg.successToast'));
      form.reset();
      setSubmitted(true);
    } catch (err) {
      notifyError(err, lang);
    }
  }

  const govs = ["amman", "irbid", "zarqa", "balqa", "madaba", "karak", "tafilah", "maan", "aqaba", "jerash", "ajloun", "mafraq"];
  const cats = ["charity", "development", "women", "special", "culture", "sports", "union"];

  return (
    <section className="py-24 bg-muted/10 border-t border-border/50 text-center" id="register">
      <div className="container max-w-3xl px-4 sm:px-8 mx-auto">
        
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-full bg-transparent text-primary items-center justify-center mb-6 mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span>{t('reg.headingPrefix')}</span>
            <span className="brand-gradient">{t('reg.headingAccent')}</span>
            <span>{t('reg.headingSuffix')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t('reg.desc')}</p>
        </div>

        <div className="bg-transparent border border-border/50 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-transparent text-primary flex items-center justify-center mx-auto">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{t('reg.b1Title')}</h4>
                <p className="text-xs text-muted-foreground">{t('reg.b1Desc')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-transparent text-primary flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{t('reg.b2Title')}</h4>
                <p className="text-xs text-muted-foreground">{t('reg.b2Desc')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-transparent text-primary flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{t('reg.b3Title')}</h4>
                <p className="text-xs text-muted-foreground">{t('reg.b3Desc')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-transparent text-primary flex items-center justify-center mx-auto">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{t('reg.b4Title')}</h4>
                <p className="text-xs text-muted-foreground">{t('reg.b4Desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="bg-primary/5 border border-primary/30 rounded-2xl p-6 md:p-8 shadow-sm mb-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">
              {isAr ? "تم استلام طلب التسجيل" : "Registration request received"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              {isAr
                ? "طلبك قيد المراجعة من قِبَل فريق بركة للتحقق من البيانات والوثائق. ستصلك نتيجة المراجعة خلال ٣–٥ أيام عمل على رقم الهاتف أو البريد المُسجَّل."
                : "Your request is under review by the Baraka team to verify your details and documents. We will contact you with the result within 3–5 business days."}
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              {isAr ? "إرسال طلب آخر" : "Submit another request"}
            </Button>
          </div>
        )}

        {!submitted && (
        <div className="bg-transparent border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="orgName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">{t('reg.fName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('reg.fNamePh')} className="h-12 bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="governorate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('reg.fGov')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background">
                            <SelectValue placeholder={t('reg.fGovPh')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {govs.map(g => (
                            <SelectItem key={g} value={g}>{t(`govs.${g}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('reg.fCat')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background">
                            <SelectValue placeholder={t('reg.fCatPh')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cats.map(c => (
                            <SelectItem key={c} value={c}>{t(`dir.cats.${c}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="regNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">
                      {t('reg.fReg')}
                      <span className="text-muted-foreground font-normal text-xs">{t('reg.fRegHint')}</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('reg.fRegPh')} className="h-12 bg-background font-en text-left dir-ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">{t('reg.fAbout')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('reg.fAboutPh')} 
                        className="min-h-[120px] bg-background resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-8" />

              <div className="space-y-6">
                <h3 className="font-bold text-lg">{t('reg.contact')}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">{t('reg.fCname')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('reg.fCnamePh')} className="h-12 bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">{t('reg.fCphone')}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t('reg.fCphonePh')} className="h-12 bg-background font-en text-left dir-ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-bold flex items-center gap-2">
                          {t('reg.fEmail')}
                          <span className="text-muted-foreground font-normal text-xs">{t('reg.fEmailHint')}</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('reg.fEmailPh')} className="h-12 bg-background font-en text-left dir-ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" disabled={mutation.isPending} className="w-full gap-2 rounded-full text-base h-14 mt-8">
                <Building2 className="w-5 h-5" />
                <span>{mutation.isPending ? (isAr ? "جارٍ الإرسال..." : "Sending...") : t('reg.submit')}</span>
              </Button>
            </form>
          </Form>
        </div>
        )}

      </div>
    </section>
  );
}
