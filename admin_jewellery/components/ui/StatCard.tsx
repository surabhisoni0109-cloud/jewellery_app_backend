interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "brand" | "success" | "warning" | "error";
  description?: string;
}

const colorMap = {
  brand: "bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400",
  success: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  warning: "bg-warning-50 text-warning-500 dark:bg-warning-500/10 dark:text-warning-400",
  error: "bg-error-50 text-error-500 dark:bg-error-500/10 dark:text-error-400",
};

export default function StatCard({ title, value, icon, color, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs hover:shadow-theme-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h3>
      {description && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{description}</p>
      )}
    </div>
  );
}
