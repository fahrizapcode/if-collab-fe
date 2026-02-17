"use client";

type Props = {
  data: number[]; // wajib 6 angka
};

export default function MonthlyActiveUsersChart({ data }: Props) {
  if (data.length !== 6) {
    console.warn("Data harus berisi 6 angka");
    return null;
  }

  const now = new Date();

  // 🔹 Generate 6 nama bulan (6 bulan terakhir)
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return date.toLocaleString("id-ID", { month: "short" });
  });

  const maxValue = Math.max(...data);

  return (
    <div className="bg-gray-100 p-5 rounded-xl">
      <h2 className="text-xl font-bold text-purple-800 mb-5">
        Total User Aktif (1 bulan)
      </h2>

      <div className="flex items-end justify-between h-48 gap-4">
        {data.map((value, index) => {
          const heightPercent = (value / maxValue) * 100;

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-end h-full"
            >
              {/* BAR */}
              <div
                className="w-6 bg-purple-700 rounded-full transition-all duration-500"
                style={{
                  height: `${heightPercent}%`,
                  minHeight: value > 0 ? "12px" : "0px",
                }}
              />

              {/* LABEL BULAN */}
              <p className="mt-3 text-sm font-semibold">{months[index]}</p>

              {/* ANGKA */}
              <p className="text-gray-500 italic text-sm">{value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
