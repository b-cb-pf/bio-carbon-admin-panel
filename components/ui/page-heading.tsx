import type { ReactNode } from "react";

export function PageHeading({ icon, title, actions }: { icon?: ReactNode; title: string; actions?: ReactNode }) {
  return <div className="page-title-row"><div className="page-title">{icon && <span>{icon}</span>}<h1>{title}</h1></div>{actions && <div className="page-actions">{actions}</div>}</div>;
}
