import { useState } from "react";
import { useAsync, useToasts } from "@ui";
import { api } from "./api.ts";

export const useTokens = () => useAsync(() => api.tokens(), []);

export const useCatalog = () => useAsync(() => api.catalog(), []);

export const useDemo = () => {
  const [modal, setModal] = useState(false);
  const toasts = useToasts();

  return { modal, openModal: () => setModal(true), closeModal: () => setModal(false), toasts };
};

export const useDesignScreen = () => {
  const tokens = useTokens();
  const catalog = useCatalog();
  const demo = useDemo();

  return { tokens, catalog, demo };
};
