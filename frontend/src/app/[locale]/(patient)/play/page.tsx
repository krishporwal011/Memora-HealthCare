import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { BigButton } from "@/components/patient/BigButton";

export default function PatientPlayPage() {
  const t = useTranslations("Play");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full py-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-semibold text-[#1B3B36] p-2 hover:bg-[#F2EFE9] rounded-xl no-underline"
          style={{ minHeight: "48px" }}
        >
          <span aria-hidden="true">⬅️</span>
          <span>{tCommon("back")}</span>
        </Link>
        <span className="text-sm font-semibold text-[#52504C] bg-white px-3 py-1.5 rounded-full border border-[#D1CEC4]">
          {t("todayIs")}: {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 border-3 border-[#1B3B36] shadow-sm text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#F8F6F0] flex items-center justify-center text-4xl border-2 border-[#1B3B36]" aria-hidden="true">
          🌱
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#1B3B36]">
          {t("title")}
        </h2>
        <p className="text-lg text-[#52504C] leading-relaxed max-w-sm mx-auto">
          {t("matchGamePrompt")}
        </p>
      </div>

      {/* Primary single action for patient: 64px high */}
      <div className="pt-4">
        <BigButton
          label={t("startSession")}
          icon="▶️"
          variant="primary"
          aria-label={t("startSession")}
        />
      </div>
    </div>
  );
}
