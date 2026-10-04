import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/common/Header";
import { OfflineBanner } from "@/components/common/OfflineBanner";

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
            className="mt-auto py-5 px-4 text-center text-xs"
            style={{
              background: "var(--surface-2)",
              borderTop: "1px solid var(--border)",
              color: "var(--ink-muted)",
            }}
          >
            <div className="max-w-3xl mx-auto space-y-1">
              <p className="font-bold text-sm" style={{ color: "var(--ink-soft)" }}>
                Memora · Smart India Hackathon 2026 (SIH26003)
              </p>
              <p>
                Non-diagnostic cognitive stimulation and caregiver assistance platform.{" "}
                Consult a healthcare professional for clinical advice.
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
