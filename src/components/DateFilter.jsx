import { useState, useRef, useEffect } from "react";

function DateFilter({
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
  customRange,
  setCustomRange,
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const presets = [
    { id: "24h", label: "24h" },
    { id: "7D", label: "7D" },
    { id: "30D", label: "30D" },
    { id: "1Y", label: "1Y" },
    { id: "custom", label: "Custom" },
  ];

  const startDate = customRange?.startDate || "";
  const endDate = customRange?.endDate || customDate || "";

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectPreset = (id) => {
    setDateFilter(id);
    if (id === "custom") {
      setIsPopoverOpen((prev) => !prev);
    } else {
      setIsPopoverOpen(false);
    }
  };

  const handleDateChange = (field, value) => {
    if (setCustomRange) {
      setCustomRange((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    if (field === "endDate" && setCustomDate) {
      setCustomDate(value);
    }
  };

  const handleClearCustom = () => {
    if (setCustomRange) {
      setCustomRange({ startDate: "", endDate: "" });
    }
    if (setCustomDate) {
      setCustomDate("");
    }
  };

  const formatShortDate = (dStr) => {
    if (!dStr) return "";
    try {
      const parts = dStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch {
      return dStr;
    }
    return dStr;
  };

  const getActiveFilterLabel = () => {
    switch (dateFilter) {
      case "24h":
        return "Last 24 Hours";
      case "7D":
        return "Last 7 Days";
      case "30D":
        return "Last 30 Days";
      case "1Y":
        return "Last 365 Days";
      case "custom":
        if (startDate && endDate) {
          return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
        }
        if (startDate) return `From ${formatShortDate(startDate)}`;
        if (endDate) return `Until ${formatShortDate(endDate)}`;
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  const getCustomButtonLabel = () => {
    if (dateFilter === "custom" && startDate && endDate) {
      return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
    }
    return "Custom";
  };

  return (
    <div className="relative mb-6 w-full" ref={popoverRef}>
      {/* Modern SaaS Control Bar Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full p-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl">
        {/* Left: Calendar Icon + Segmented Control Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Calendar Icon Badge */}
          <div className="flex items-center justify-center pl-2 pr-1 text-slate-400">
            <svg
              className="w-4 h-4 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
          </div>

          {/* Segmented Control Pills */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
            {presets.map((preset) => {
              const isActive = dateFilter === preset.id;
              const isCustom = preset.id === "custom";

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                  }`}
                >
                  <span>{isCustom ? getCustomButtonLabel() : preset.label}</span>

                  {/* Chevron icon for Custom dropdown */}
                  {isCustom && (
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${
                        isPopoverOpen
                          ? "rotate-180 text-white"
                          : isActive
                          ? "text-white/80"
                          : "text-slate-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Active Filter Feedback Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 border border-slate-800/60 rounded-xl text-xs text-slate-300 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">Period:</span>
          <span className="text-indigo-300 font-semibold">{getActiveFilterLabel()}</span>
        </div>
      </div>

      {/* Popover Dropdown for Custom Date Range */}
      {isPopoverOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 md:left-48 mt-2 w-72 sm:w-80 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
              Select Custom Range
            </span>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-xs p-1 rounded-md hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>

          {/* Quick Preset Shortcuts inside Popover */}
          <div className="mb-3.5">
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Quick Select
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "24h", label: "24h" },
                { id: "7D", label: "7D" },
                { id: "30D", label: "30D" },
                { id: "1Y", label: "1Y" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item.id)}
                  className="py-1 text-[11px] font-medium bg-slate-950/60 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-800 rounded-lg transition text-center"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Inputs with Small Calendar Icons */}
          <div className="space-y-3">
            {/* Start Date Field */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <div
                onClick={() => startInputRef.current?.showPicker?.()}
                className="relative flex items-center bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 cursor-pointer focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition group"
              >
                <svg
                  className="w-4 h-4 text-indigo-400 shrink-0 mr-2.5 transition-transform group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                </svg>
                <input
                  ref={startInputRef}
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange("startDate", e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* End Date Field */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                End Date
              </label>
              <div
                onClick={() => endInputRef.current?.showPicker?.()}
                className="relative flex items-center bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 cursor-pointer focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition group"
              >
                <svg
                  className="w-4 h-4 text-indigo-400 shrink-0 mr-2.5 transition-transform group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                </svg>
                <input
                  ref={endInputRef}
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleClearCustom}
                className="text-xs text-slate-400 hover:text-slate-200 transition font-medium px-2 py-1 rounded-md hover:bg-slate-800/50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsPopoverOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/30 transition active:scale-95"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateFilter;
