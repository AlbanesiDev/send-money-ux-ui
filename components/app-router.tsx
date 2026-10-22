"use client";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PageOperations from "@/app/operations/PageOperations";
import PagePayments from "@/app/payments/PagePayments";
import PageRemittences from "@/app/remittences/PageRemittences";
import PageTransactionsHistory from "@/app/transactions-history/PageTransactionsHistory";
import { AppShell } from "./layout/app-shell";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/remittences" replace />} />
        <Route element={<AppShell />}>
          <Route path="remittences" element={<PageRemittences />} />
          <Route path="payments" element={<PagePayments />} />
          <Route path="operations" element={<PageOperations />} />
          <Route
            path="transactions-history"
            element={<PageTransactionsHistory />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/remittences" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
