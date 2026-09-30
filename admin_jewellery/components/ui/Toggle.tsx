"use client";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`h-6 w-11 rounded-full border-2 transition-all duration-200 ${
          checked
            ? "border-brand-500 bg-brand-500"
            : "border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
          style={{ width: "18px", height: "18px", top: "2px", left: checked ? "auto" : "2px", right: checked ? "2px" : "auto", position: "absolute" }}
        />
      </div>
    </label>
  );
}
