export interface PortfolioSectionContent {
  [key: string]: string;
}

export interface PortfolioSection {
  title: string;
  content: PortfolioSectionContent;
}

export interface PortfolioData {
  overview: PortfolioSection;
  foundation: PortfolioSection;
  design_system: PortfolioSection;
  pacing: PortfolioSection;
  combat_design: PortfolioSection;
  playtest_summary: PortfolioSection;
}

export interface GeneratedAsset {
  title: string;
  url: string; // base64 data URL
}
