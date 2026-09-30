import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function AshaDashboardPage() {
  const t = useTranslations("Asha");
  const tCommon = useTranslations("Common");

  const elders = [
    { id: "1", name: "R. Goswami (Guwahati)", status: "steady", label: t("steady"), color: "bg-[#EAF3EE] text-[#2D6A4F] border-[#2D6A4F]" },
    { id: "2", name: "M. Sharma (Tezpur)", status: "checkin", label: t("checkinSuggested"), color: "bg-[#FDF0ED] text-[#A83A2A] border-[#A83A2A]" },
    { id: "3", name: "B. Devi (Silchar)", status: "watch", label: t("watch"), color: "bg-[#FDF8EC] text-[#B07D14] border-[#B07D14]" },
  ];

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full py-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold text-[#1B3B36] p-2 hover:bg-[#F2EFE9] rounded-xl no-underline"
          style={{ minHeight: "44px" }}
        >
          <span aria-hidden="true">⬅️</span>
          <span>{tCommon("back")}</span>
        </Link>
        <span className="text-sm font-semibold text-[#2D6A4F] bg-[#EAF3EE] px-3 py-1.5 rounded-full border border-[#2D6A4F]">
          Community Health Worker
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#D1CEC4] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1A]">
            {t("title")}
          </h2>
          <p className="text-sm text-[#52504C] mt-1">
            Monitoring 3 assigned households in Primary Health Centre sector.
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-3 rounded-xl bg-[#1B3B36] text-white font-semibold text-sm hover:bg-[#122824] transition-colors flex items-center justify-center gap-2 shrink-0 border border-[#1B3B36]"
          style={{ minHeight: "48px" }}
        >
          <span aria-hidden="true">📥</span>
          <span>{t("exportReport")}</span>
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#1C1C1A] px-1">{t("assignedElders")}</h3>
        {elders.map((elder) => (
          <div
            key={elder.id}
            className="p-4 bg-white rounded-2xl border border-[#D1CEC4] shadow-xs flex items-center justify-between gap-3 hover:bg-[#F8F6F0] transition-colors"
          >
            <div>
              <span className="font-bold text-base text-[#1C1C1A] block">{elder.name}</span>
              <span className="text-xs text-[#52504C]">Last active: Today, 9:45 AM</span>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${elder.color}`}>
              {elder.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
