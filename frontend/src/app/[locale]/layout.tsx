import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { Header } from "@/components/common/Header";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const showEventBadge = process.env.NEXT_PUBLIC_SHOW_EVENT_BADGE === "true";

  return (
    <html lang={locale}>
      <body
        className="flex flex-col min-h-screen"
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <OfflineBanner />
          <main
            className="flex-1 w-full mx-auto flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {children}
          </main>
          <footer
            className="mt-auto py-4 px-4 text-center text-xs border-t"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-soft)",
              color: "var(--ink-muted)",
            }}
          >
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>
                <span>Memora · North East India</span>
                <span aria-hidden="true" className="opacity-40">·</span>
                <Link href="/privacy" className="hover:underline">
                  Privacy & Consent
                </Link>
                <span aria-hidden="true" className="opacity-40">·</span>
                <Link href="/settings" className="hover:underline">
                  Settings
                </Link>
                <span aria-hidden="true" className="opacity-40">·</span>
                <Link href="/sync" className="hover:underline">
                  Sync Status
                </Link>
                {showEventBadge && (
                  <>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)] font-bold text-[10px]">
                      SIH 2026 · NER
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-tight max-w-xl mx-auto">
                Non-diagnostic cognitive stimulation and caregiver assistance platform.
                Consult a healthcare professional for clinical advice.
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
