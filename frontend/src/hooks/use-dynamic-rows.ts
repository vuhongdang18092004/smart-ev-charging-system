"use client";

import { useRef, useState } from "react";

export function useDynamicRows<T>(initial: readonly T[]) {
  const [rows, setRows] = useState(() =>
    initial.map((value, key) => ({ key, value })),
  );
  const nextKey = useRef(initial.length);

  return {
    rows,
    add(value: T) {
      const key = nextKey.current++;
      setRows((current) => [...current, { key, value }]);
    },
    remove(key: number) {
      setRows((current) => current.filter((row) => row.key !== key));
    },
  };
}
