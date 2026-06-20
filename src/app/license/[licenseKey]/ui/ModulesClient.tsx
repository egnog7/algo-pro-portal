"use client";

import { ModuleInfo } from "@/lib/api";

export default function ModulesClient({
  modules,
}: {
  modules: ModuleInfo[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {modules.map((m) => (
        <div
          key={m.id}
          className="border rounded-xl p-4 bg-white"
        >
          <div className="flex justify-between">
            <h3 className="font-semibold">
              {m.name}
            </h3>

            <span
              className={
                m.enabled
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {m.enabled
                ? "Enabled"
                : "Locked"}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {m.category}
          </p>

          <p className="mt-2 text-sm">
            {m.description}
          </p>

          <p className="mt-3 text-xs text-gray-400">
            v{m.version}
          </p>
        </div>
      ))}
    </div>
  );
}