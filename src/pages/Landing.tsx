import SidebarLayout from "../components/SidebarLayout";
import LandingAbout from "../components/landing/LandingAbout";
import LandingGallery from "../components/landing/LandingGallery";
import LandingHero from "../components/landing/LandingHero";
import {
  LandingSidebarAction,
  LandingSidebarBody,
} from "../components/landing/LandingSidebar";
import { landingSidebarClassName } from "../components/landing/LandingSidebarClassName";
import pageShell from "../styles/PageShell.module.css";

export default function Landing() {
  return (
    <SidebarLayout
      pageClassName={pageShell.pageShell}
      contentClassName={pageShell.content}
      sidebarClassName={landingSidebarClassName}
      sidebarBody={<LandingSidebarBody />}
      sidebarAction={<LandingSidebarAction />}
    >
      <LandingHero />
      <LandingGallery />
      <LandingAbout />
    </SidebarLayout>
  );
}
