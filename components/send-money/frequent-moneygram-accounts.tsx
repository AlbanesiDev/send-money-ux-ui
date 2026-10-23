"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { MoneygramAccount } from "./types";

export function FrequentMoneygramAccounts({
  accounts,
  selectedAccount,
  onSelectAccount,
}: {
  accounts: MoneygramAccount[];
  selectedAccount: number;
  onSelectAccount: (index: number) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const visible = accounts.flatMap((account, index) => {
    if (normalizedQuery === "") {
      return [{ account, index }];
    }
    const haystack =
      `${account.company} ${account.accountNumber} ${account.city} ${account.reference}`.toLowerCase();
    if (!haystack.includes(normalizedQuery)) {
      return [];
    }
    return [{ account, index }];
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border border-l-4 border-l-party-beneficiary-border bg-card p-5 shadow-sm">
      <h2 className="font-bold text-party-beneficiary-fg">Cuentas frecuentes</h2>
      <div>
        {visible.length > 0 && (
          <label className="relative mt-2 flex w-full">
            <span className="sr-only">Buscar cuenta</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por compañía, cuenta o ciudad…"
              className="h-10 w-full rounded-lg border border-input bg-card py-2 pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-amount focus:ring-4 focus:ring-amount/10"
            />
          </label>
        )}

        {visible.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border bg-card px-4 py-4 text-sm text-muted-foreground">
            {normalizedQuery === ""
              ? "Todavía no hay cuentas frecuentes. Completá el formulario para guardar una."
              : `No encontramos cuentas con “${query.trim()}”.`}
          </p>
        ) : (
          <div
            role="list"
            aria-label="Cuentas frecuentes Moneygram"
            className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-thin [&::-webkit-scrollbar]:h-1.5"
          >
            {visible.map(({ account, index }) => {
              const selected = selectedAccount === index;
              let cardClass = "border-border bg-card hover:border-amount/50";
              if (selected) {
                cardClass = "border-amount bg-accent ring-2 ring-amount/20";
              }
              return (
                <button
                  key={account.id}
                  type="button"
                  role="listitem"
                  onClick={() => onSelectAccount(index)}
                  aria-pressed={selected}
                  className={`w-55 shrink-0 cursor-pointer rounded-xl border p-4 text-left transition-colors ${cardClass}`}
                >
                  <p className="truncate text-sm font-bold text-foreground">
                    {account.company}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {account.accountNumber} · {account.city}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
