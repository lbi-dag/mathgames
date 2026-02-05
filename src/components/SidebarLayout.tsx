import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import sidebarStyles from "../styles/Sidebar.module.css";

type SidebarLayoutProps = {
  pageClassName: string;
  contentClassName: string;
  sidebarClassName?: string;
  sidebarBody?: ReactNode;
  sidebarAction?: ReactNode;
  children: ReactNode;
};

export default function SidebarLayout({
  pageClassName,
  contentClassName,
  sidebarClassName,
  sidebarBody,
  sidebarAction,
  children,
}: SidebarLayoutProps) {
  return (
    <div className={pageClassName}>
      <aside className={`${sidebarStyles.sidebar} ${sidebarClassName ?? ""}`.trim()}>
        <Link className={sidebarStyles.siteLogo} to="/" aria-label="Math Games home">
          <svg className={sidebarStyles.logoMark} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <circle className={sidebarStyles.logoRing} cx="24" cy="24" r="18" />
            <path className={sidebarStyles.logoPlus} d="M24 16v16M16 24h16" />
            <circle className={sidebarStyles.logoDot} cx="34" cy="14" r="4" />
          </svg>
          <span className={sidebarStyles.logoText}>Math Games</span>
        </Link>
        {sidebarBody}
        {sidebarAction}
      </aside>

      <main className={contentClassName}>{children}</main>
    </div>
  );
}
