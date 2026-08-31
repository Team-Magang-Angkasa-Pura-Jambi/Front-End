import { PAGE_GUIDES } from "./common/constants/pageGuides";
import * as fs from "fs";

const guides = PAGE_GUIDES.map(g => ({
  ...g,
  icon_name: (g.icon as any)?.render?.name || (g.icon as any)?.name || "Info",
  buttons: g.buttons.map(b => ({
    ...b,
    icon: (b.icon as any)?.render?.name || (b.icon as any)?.name || "Info"
  }))
}));

// Fallback to extract from source using regex if name is minified/not available
// Actually Lucide icons have proper function names like "LayoutDashboard"

fs.writeFileSync("guides.json", JSON.stringify(guides, null, 2));
console.log("Written guides.json");
