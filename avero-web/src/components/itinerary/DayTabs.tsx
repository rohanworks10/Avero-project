import type { TripDay } from "@/lib/trips-store";

export type ItineraryView = "list" | "journey";

type DayTabsProps = {
  days: TripDay[];
  selectedIndex: number;
  onSelectDay: (index: number) => void;
  view: ItineraryView;
  onChangeView: (view: ItineraryView) => void;
};

function formatDayDate(date: string): string {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DayTabs({
  days,
  selectedIndex,
  onSelectDay,
  view,
  onChangeView,
}: DayTabsProps) {
  return (
    <div className="sticky top-0 z-30 -mx-4 border-y border-teal-navy/10 bg-cream/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-label="Trip days"
          className="flex items-center gap-2 overflow-x-auto pb-0.5"
        >
          {days.map((day, index) => {
            const active = selectedIndex === index;
            return (
              <button
                key={`${day.dayNumber}-${day.date}`}
                type="button"
                onClick={() => onSelectDay(index)}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-terracotta text-white"
                    : "border border-teal-navy/15 bg-white text-teal-navy hover:border-terracotta/50"
                }`}
              >
                <span>Day {day.dayNumber}</span>
                {formatDayDate(day.date) && (
                  <span className={active ? "text-white/80" : "text-teal-navy/55"}>
                    {formatDayDate(day.date)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Itinerary view"
          className="inline-flex self-start rounded-full border border-teal-navy/10 bg-white p-1 sm:self-auto"
        >
          <button
            type="button"
            onClick={() => onChangeView("list")}
            aria-pressed={view === "list"}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              view === "list" ? "bg-terracotta text-white" : "text-teal-navy"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              className="size-3.5"
            >
              <path
                d="M5 4h8M5 8h8M5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            List
          </button>
          <button
            type="button"
            onClick={() => onChangeView("journey")}
            aria-pressed={view === "journey"}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              view === "journey"
                ? "bg-terracotta text-white"
                : "text-teal-navy"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              className="size-3.5"
            >
              <path
                d="M3 3h4v4H3zM9 9h4v4H9zM7 5h2a2 2 0 0 1 2 2v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            Journey
          </button>
        </div>
      </div>
    </div>
  );
}
