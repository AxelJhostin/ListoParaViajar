import type { ComponentProps } from "react";
// Native document navigation uses the precached route HTML even on first offline visit.
export default function NavLink({
  prefetch,
  ...props
}: ComponentProps<"a"> & { prefetch?: boolean }) {
  void prefetch;
  return <a {...props} />;
}
