import { SearchPanel } from "@/components/SearchPanel";
import { SiteStats } from "@/components/SiteStats";

export default function HomePage() {
  return (
    <>
      <h1>Dig through the charts</h1>
      <SiteStats />
      <SearchPanel />
    </>
  );
}
