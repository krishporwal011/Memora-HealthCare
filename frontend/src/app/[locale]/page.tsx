import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations("Roles");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-6">
      <div className="w-full max-w-xl text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B3B36] tracking-tight mb-2">
          {t("selectRole")}
        </h2>
        <p className="text-base text-[#52504C]">{tCommon("disclaimer")}</p>
      </div>

      <div className="w-full max-w-xl space-y-4">
        {/* Role 1: Patient / Play */}
        <Link
          href="/play"
          className="block p-6 bg-white rounded-3xl border-3 border-[#1B3B36] hover:bg-[#F2EFE9] transition-all shadow-md group no-underline text-inherit"
          style={{ minHeight: "84px" }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl bg-[#1B3B36] text-white flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              🌸
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1B3B36] block">
                {t("patientTitle")}
              </span>
              <span className="text-sm text-[#52504C] block mt-1">
                {t("patientSubtitle")}
              </span>
            </div>
          </div>
        </Link>

        {/* Role 2: Caregiver */}
        <Link
          href="/care"
          className="block p-6 bg-white rounded-3xl border-2 border-[#D1CEC4] hover:border-[#C85A32] hover:bg-[#F2EFE9] transition-all shadow-sm group no-underline text-inherit"
          style={{ minHeight: "84px" }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              🏡
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1C1C1A] block">
                {t("caregiverTitle")}
              </span>
              <span className="text-sm text-[#52504C] block mt-1">
                {t("caregiverSubtitle")}
              </span>
            </div>
          </div>
        </Link>

        {/* Role 3: ASHA / Clinician */}
        <Link
          href="/asha"
          className="block p-6 bg-white rounded-3xl border-2 border-[#D1CEC4] hover:border-[#1B3B36] hover:bg-[#F2EFE9] transition-all shadow-sm group no-underline text-inherit"
          style={{ minHeight: "84px" }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              🩺
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1C1C1A] block">
                {t("ashaTitle")}
              </span>
              <span className="text-sm text-[#52504C] block mt-1">
                {t("ashaSubtitle")}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
