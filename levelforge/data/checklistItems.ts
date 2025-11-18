import type { ChecklistCategory } from '../types/portfolio';

export const checklistData: ChecklistCategory[] = [
  {
    title: 'Planning & Foundation',
    items: [
      { id: 'plan-restrictions', label: 'Identified design restrictions (technical, time, assets)' },
      { id: 'plan-goals', label: 'Set clear, achievable design goals for the level' },
      { id: 'plan-goldenpath', label: 'Defined the primary golden path for the player' },
      { id: 'plan-context', label: 'Considered the level\'s context within the overall game progression' },
      { id: 'plan-sketch', label: 'Created an initial paper or digital sketch of the layout' },
      { id: 'plan-player-fantasy', label: 'Defined the core player fantasy the level should deliver' },
    ],
  },
  {
    title: 'Navigation & Guidance',
    items: [
      { id: 'nav-macro', label: 'Established a clear macro landmark (weenie) visible from afar' },
      { id: 'nav-meso', label: 'Placed meso landmarks to define major zones or areas' },
      { id: 'nav-micro', label: 'Used micro landmarks for localized orientation' },
      { id: 'nav-signposting', label: 'Implemented clear, non-verbal signposting (lighting, composition)' },
      { id: 'nav-language', label: 'Maintained a consistent visual language (e.g., yellow = climbable)' },
      { id: 'nav-denial', label: 'Used denial and reward to guide player exploration' },
    ],
  },
  {
    title: 'Pacing & Flow',
    items: [
      { id: 'pace-flow', label: 'Defined and executed a clear flow structure (linear, hub, etc.)' },
      { id: 'pace-gates', label: 'Placed gates to control progression and build anticipation' },
      { id: 'pace-valves', label: 'Used valves (one-way drops) to prevent backtracking where needed' },
      { id: 'pace-loops', label: 'Created satisfying loops and unlockable shortcuts' },
      { id: 'pace-intensity', label: 'Mapped and implemented a dynamic intensity curve' },
      { id: 'pace-safezones', label: 'Provided clear "safe zones" for player rest and preparation' },
    ],
  },
  {
    title: 'Combat & Encounters',
    items: [
      { id: 'combat-arenas', label: 'Designed distinct and memorable combat arenas' },
      { id: 'combat-cover', label: 'Provided a variety of cover types (full, half, destructible)' },
      { id: 'combat-verticality', label: 'Used verticality and high ground to create tactical options' },
      { id: 'combat-flanking', label: 'Created clear and risky flanking routes for players and AI' },
      { id: 'combat-sightlines', label: 'Tested and varied sightlines for different engagement ranges' },
      { id: 'combat-introduction', label: 'Introduced enemies and mechanics in a scaffolded way' },
    ],
  },
  {
    title: 'Experience & Immersion',
    items: [
      { id: 'exp-atmosphere', label: 'Established a strong, consistent atmosphere and mood' },
      { id: 'exp-narrative', label: 'Integrated narrative elements through environmental storytelling' },
      { id: 'exp-memorable', label: 'Crafted at least one highly memorable moment or set piece' },
      { id: 'exp-visual-interest', label: 'Varied visual interest and broke up repetition' },
      { id: 'exp-rewards', label: 'Rewarded player curiosity with secrets or optional content' },
      { id: 'exp-affordance', label: 'Ensured interactive objects have clear affordances' },
    ],
  },
];
