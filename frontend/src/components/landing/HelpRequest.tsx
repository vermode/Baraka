import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { HandCoins, ShieldCheck, Clock, CheckCircle2, KeyRound, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { notifyError, notifySuccess } from "@/lib/errors";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCreateHelpRequest } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2, "مطلوب"),
  phone: z
    .string()
    .regex(/^(077|078|079)[0-9]{7}$/, "يجب أن يبدأ بـ 077/078/079 ويتكون من 10 أرقام"),
  governorate: z.string().min(1, "مطلوب"),
  aid: z.string().min(1, "مطلوب"),
  description: z.string().min(10, "يرجى كتابة وصف أوضح"),
});

export function HelpRequest() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [submitted, setSubmitted] = useState(false);
  const [trackingOtp, setTrackingOtp] = useState<string | null>(null);
  const mutation = useCreateHelpRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      governorate: "",
      aid: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const created = await mutation.mutateAsync({
        data: {
          name: values.name,
          phone: values.phone,
          governorate: values.governorate,
          aidType: values.aid,
          description: values.description,
        },
      });
      notifySuccess(t('help.successToast'));
      form.reset();
      setTrackingOtp(created.otp ?? null);
      setSubmitted(true);
    } catch (err) {
      notifyError(err, lang);
    }
  }

  const govs = ["amman", "irbid", "zarqa", "balqa", "madaba", "karak", "tafilah", "maan", "aqaba", "jerash", "ajloun", "mafraq"];
  const aids = ["financial", "food", "medical", "education", "housing", "orphan"];

  return (
    <section className="py-24 bg-background text-center" id="help">
      <div className="container max-w-3xl px-4 sm:px-8 mx-auto">
        
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-full bg-transparent text-primary items-center justify-center mb-6 mx-auto">
            <HandCoins className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('help.heading')}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t('help.desc')}</p>
        </div>

        <div className="bg-transparent border border-border/50 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-transparent text-primary flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{t('help.b1Title')}</h4>
                <p className="text-xs text-muted-foreground">{t('help.b1Desc')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-transparent text-primary flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{t('help.b2Title')}</h4>
                <p className="text-xs text-muted-foreground">{t('help.b2Desc')}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-transparent text-primary flex items-center justify-center mx-auto">
                <HandCoins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{t('help.b3Title')}</h4>
                <p className="text-xs text-muted-foreground">{t('help.b3Desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="bg-primary/5 border border-primary/30 rounded-2xl p-6 md:p-8 shadow-sm mb-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">
              {isAr ? "تم استلام طلبك" : "Request received"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              {isAr
                ? "طلبك قيد المراجعة من قِبَل فريق بركة. سيتواصل معك أحد ممثلينا خلال ٤٨ ساعة لتأكيد التفاصيل وتوصيلك بأنسب جمعية. احتفظ برمز التتبع أدناه لمتابعة التبرعات وتأكيد استلامها."
                : "Your request is under review by the Baraka team. A representative will contact you within 48 hours to confirm details and connect you with the right charity. Keep the tracking code below to follow donations and confirm receipt."}
            </p>
            {trackingOtp && (
              <div className="max-w-sm mx-auto mb-4">
                <div className="inline-flex items-center gap-2 font-mono text-lg tracking-widest bg-primary/10 text-primary rounded-xl px-4 py-3">
                  <KeyRound className="h-5 w-5" />
                  {trackingOtp}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isAr ? "رمز التتبع الخاص بك — لا تشاركه إلا مع بركة." : "Your tracking code — keep it private."}
                </p>
                <Link href={`/track?type=request&otp=${trackingOtp}`}>
                  <Button className="mt-3 gap-1.5">
                    <Search className="h-4 w-4" />
                    {isAr ? "تتبع طلبي" : "Track my request"}
                  </Button>
                </Link>
              </div>
            )}
            <div>
              <Button variant="outline" onClick={() => { setSubmitted(false); setTrackingOtp(null); }}>
                {isAr ? "إرسال طلب آخر" : "Submit another request"}
              </Button>
            </div>
          </div>
        )}

        {!submitted && (
        <div className="bg-transparent border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('help.fName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('help.fNamePh')} className="h-12 bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('help.fPhone')}</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder={t('help.fPhonePh')} className="h-12 bg-background font-en text-left dir-ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="governorate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('help.fGov')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background">
                            <SelectValue placeholder={t('help.fGovPh')} />
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
                  name="aid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('help.fType')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background">
                            <SelectValue placeholder={t('help.fTypePh')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {aids.map(a => (
                            <SelectItem key={a} value={a}>{t(`aids.${a}`)}</SelectItem>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">{t('help.fDesc')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('help.fDescPh')} 
                        className="min-h-[120px] bg-background resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" disabled={mutation.isPending} className="w-full gap-2 rounded-full text-base h-14">
                <HandCoins className="w-5 h-5" />
                <span>{mutation.isPending ? (isAr ? "جارٍ الإرسال..." : "Sending...") : t('help.submit')}</span>
              </Button>
            </form>
          </Form>
        </div>
        )}

      </div>
    </section>
  );
}
