"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { UIProvider } from "@/components/providers/UIProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <UIProvider>
        {children}
      </UIProvider>
    </Provider>
  );
}
