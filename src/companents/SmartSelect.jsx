import { useMemo, useState } from "react";

const SmartSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seçin və ya yazın",
  isDarkmodeEnabled,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const search = value.trim().toLowerCase();
    if (!search) return options;

    return options.filter((item) =>
      String(item).toLowerCase().includes(search)
    );
  }, [options, value]);

  return (
    <div className="relative">
      <label className="block mb-2 text-sm sm:text-base font-medium">
        {label}
      </label>

      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        className={`w-full h-[48px] px-4 rounded-xl outline-none border transition ${
          isDarkmodeEnabled
            ? "bg-[#171717] border-white/15 text-white placeholder-gray-400 focus:border-red-500"
            : "bg-white border-gray-200 text-black placeholder-gray-500 focus:border-red-500"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />

      {open && !disabled && (
        <>
          <div
            className={`absolute z-50 mt-2 w-full max-h-[240px] overflow-y-auto rounded-2xl border shadow-2xl ${
              isDarkmodeEnabled
                ? "bg-[#111111] border-white/15 text-white"
                : "bg-white border-gray-200 text-black"
            }`}
          >
            {value.trim() && !options.includes(value.trim()) && (
              <button
                type="button"
                onMouseDown={() => {
                  onChange(value.trim());
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-semibold ${
                  isDarkmodeEnabled
                    ? "hover:bg-white/10 text-red-300"
                    : "hover:bg-gray-100 text-red-500"
                }`}
              >
                “{value.trim()}” kimi daxil et
              </button>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition ${
                    isDarkmodeEnabled
                      ? "hover:bg-white/10"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm opacity-70">
                Siyahıda yoxdur, əl ilə daxil edə bilərsiniz.
              </div>
            )}
          </div>

          <div onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
        </>
      )}
    </div>
  );
};

export default SmartSelect;