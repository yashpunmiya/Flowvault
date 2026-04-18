import type { ReactNode } from "react";

type TocItem = {
  id: string;
  label: string;
};

type DocPageProps = {
  title: string;
  summary: string;
  toc: TocItem[];
  audience?: string;
  mode?: string;
  children: ReactNode;
};

export function DocPage({ title, summary, toc, audience, mode, children }: DocPageProps) {
  return (
    <div className="doc-page-grid">
      <article className="doc-content">
        <header className="doc-header">
          <h1>{title}</h1>
          <p>{summary}</p>
          {(audience || mode) && (
            <div className="doc-header-meta" aria-label="Page metadata">
              {audience && <span>Audience: {audience}</span>}
              {mode && <span>Mode: {mode}</span>}
            </div>
          )}
        </header>
        {children}
      </article>

      <aside className="doc-toc" aria-label="On this page">
        <h3>On this page</h3>
        <ul>
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
