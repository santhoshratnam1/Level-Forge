import { IconName } from '../components/Icon';

export interface GlossaryResource {
    title: string;
    url: string;
}

export interface GlossaryTerm {
    name: string;
    icon: IconName;
    shortDescription: string;
    longDescription: string;
    resources: GlossaryResource[];
}

export const glossary: Record<string, GlossaryTerm> = {
    // Planning
    design_restrictions: {
        name: 'Design Restrictions',
        icon: 'puzzle',
        shortDescription: 'The constraints (technical, budget, narrative, gameplay) that shape and define the design space for a level.',
        longDescription: 'Design restrictions are the foundational constraints that guide a level designer. They can be technical (engine limitations, performance budgets), resource-based (time, team size, asset availability), gameplay-driven (must include a specific mechanic), or narrative (must take place in a certain location). Embracing restrictions often leads to more creative and focused designs.',
        resources: [
            { title: 'GDC: Embracing Constraints in Game Design', url: 'https://www.youtube.com/watch?v=v3cDjovT3-E' }
        ]
    },
    design_goals: {
        name: 'Design Goals',
        icon: 'logo',
        shortDescription: 'The primary objectives the level aims to achieve for the player, such as teaching a mechanic or evoking an emotion.',
        longDescription: 'Design goals are clear, high-level objectives that the level must accomplish. Examples include "Teach the player the double-jump mechanic," "Create a feeling of vulnerability and fear," or "Provide a challenging final boss encounter." All design decisions should ideally serve these goals.',
        resources: [
            { title: 'Establishing Level Design Goals - World of Level Design', url: 'https://www.worldofleveldesign.com/categories/level_design_tutorials/level-design-101-planning-and-creating-your-level.php'}
        ]
    },
    golden_path: {
        name: 'Golden Path',
        icon: 'logo',
        shortDescription: 'The optimal or intended route for players to take to complete a level\'s main objectives.',
        longDescription: 'The Golden Path is the critical path a player is intended to follow to complete the level. Designers spend most oftheir effort ensuring this path is clear, well-paced, and engaging. While side paths and secrets are encouraged, the golden path must be robust and guide the player from start to finish.',
        resources: [
            { title: 'The Golden Path and Playtesting - Game Developer', url: 'https://www.gamedeveloper.com/design/the-golden-path-and-playtesting' }
        ]
    },
    // Navigation
    landmarks: {
        name: 'Landmarks',
        icon: 'open-world',
        shortDescription: 'Distinctive, memorable objects or locations that help players orient themselves and navigate the game world.',
        longDescription: 'Landmarks are crucial for player orientation. They can be categorized into Macro (visible from everywhere, like a giant tower), Meso (visible from a large area, like a town square), and Micro (locally unique features, like a specific statue). Effective landmarks prevent players from getting lost and make the world feel more real.',
        resources: [
            { title: 'How Landmarks Can Guide Your Player - Article by The CGBro', url: 'https://thecgbro.com/how-landmarks-can-guide-your-player/' }
        ]
    },
    signposting: {
        name: 'Signposting',
        icon: 'arrow',
        shortDescription: 'The use of subtle (and sometimes direct) cues to guide the player towards objectives or points of interest.',
        longDescription: 'Signposting involves using environmental cues to guide players. This can be explicit, like an actual sign, or implicit, like using lighting to draw attention, framing a doorway with architecture, or using trails of collectibles. Good signposting feels natural and respects the player\'s intelligence.',
        resources: [
            { title: 'GDC: Guiding the Player without a Compass', url: 'https://www.youtube.com/watch?v=F_b_a-J022E' }
        ]
    },
    visual_language: {
        name: 'Visual Language',
        icon: 'brush',
        shortDescription: 'A consistent set of visual rules and motifs that communicate gameplay information to the player.',
        longDescription: 'Visual language is a set of consistent rules that the player learns to interpret. For example, "yellow means climbable," "red barrels explode," or "blue doors are locked." A strong visual language makes the gameplay intuitive and reduces the need for explicit tutorials.',
        resources: [
            { title: 'The Importance of Visual Language in Games - Article', url: 'https://medium.com/@mikeystone/the-importance-of-visual-language-in-games-f0775e434858' }
        ]
    },
    // Pacing & Flow
    flow_structure: {
        name: 'Flow Structure',
        icon: 'ruler',
        shortDescription: 'The overall layout and progression structure of a level (e.g., linear, hub-and-spoke, open-world).',
        longDescription: 'Flow describes how players move through a space. Common structures include Linear (a single path), Hub-and-Spoke (a central area connecting to multiple smaller levels), Metroidvania (interconnected areas gated by abilities), and Open-World (a large, freely explorable space). The choice of structure heavily influences the player experience.',
        resources: [
            { title: 'Understanding Level Flow - World of Level Design', url: 'https://www.worldofleveldesign.com/categories/level_design_tutorials/how-to-design-level-layouts-part2-flow.php' }
        ]
    },
    gates_valves: {
        name: 'Gates & Valves',
        icon: 'puzzle',
        shortDescription: 'Mechanisms for controlling player progression. Gates block progress forward; valves prevent backtracking.',
        longDescription: 'Gates and valves are tools for controlling flow and pacing. A Gate is a barrier that requires a key, a puzzle solution, or defeating enemies to pass. A Valve is a one-way path, like a ledge that is too high to climb back up, which prevents the player from returning to a previous area.',
        resources: [
            { title: 'Level Design Patterns: Gates, Keys, and Locks - Gamasutra', url: 'https://www.gamedeveloper.com/design/level-design-patterns-in-2d-games' }
        ]
    },
    loops_shortcuts: {
        name: 'Loops & Shortcuts',
        icon: 'undo',
        shortDescription: 'Paths that circle back on themselves or provide a quick return to an earlier point, improving navigation.',
        longDescription: 'Layouts that loop back on themselves are excellent for creating a sense of place without forcing tedious backtracking. Shortcuts, often unlocked from the far side of a loop (e.g., kicking down a ladder), reward exploration and make repeat traversal much faster.',
        resources: []
    },
    intensity_curve: {
        name: 'Intensity Curve',
        icon: 'line',
        shortDescription: 'The planned rise and fall of action, tension, and challenge throughout a level to maintain player engagement.',
        longDescription: 'An intensity curve, or pacing graph, maps the intended player experience over time. A good level alternates between periods of high intensity (combat, difficult platforming) and low intensity (exploration, narrative, rest), preventing player burnout and creating a more dynamic and memorable experience.',
        resources: [
            { title: 'Video Game Pacing - GDC Talk by Richard Rouse III', url: 'https://www.youtube.com/watch?v=yA7-yIYA-hA' }
        ]
    },
    // Combat
    encounter_design: {
        name: 'Encounter Design',
        icon: 'fps',
        shortDescription: 'The art of crafting specific combat scenarios, including enemy placement, types, and environmental factors.',
        longDescription: 'Encounter design is the setup of a single combat scenario. It involves choosing which enemies to use, where to place them, how they are introduced (e.g., ambush, patrol), and how the environment (cover, high ground, hazards) can be used by both the player and the AI to create interesting tactical challenges.',
        resources: [
            { title: 'GDC: The Five Domains of Combat Design', url: 'https://www.youtube.com/watch?v=J9yv-fD_sBw' }
        ]
    },
    cover_layout: {
        name: 'Cover & Layout',
        icon: 'rect',
        shortDescription: 'The strategic placement of objects that provide protection from enemy fire, defining movement and combat flow.',
        longDescription: 'In shooter levels, cover is paramount. Cover can be full or half, hard (indestructible) or soft (destructible). The placement of cover dictates player movement, creates safe paths, defines combat arenas, and offers tactical choices like flanking.',
        resources: []
    },
    tactical_elements: {
        name: 'Tactical Elements',
        icon: 'grid',
        shortDescription: 'Environmental features that offer strategic advantages, such as high ground, flanking routes, and chokepoints.',
        longDescription: 'Tactical elements are features of the level geometry that create interesting combat choices. High ground offers a sightline advantage, flanking routes allow players to bypass enemy fronts, and chokepoints are narrow areas that are easy to defend but dangerous to attack.',
        resources: []
    },
    // Player Experience
    affordance: {
        name: 'Affordance',
        icon: 'plus',
        shortDescription: 'The perceived properties of an object that suggest how it can be used, without explicit instruction.',
        longDescription: 'Affordance is a property of an object that suggests its function. For example, a ladder affords climbing, a button affords pushing, and a chest-high wall affords taking cover. Good design uses affordances to make the world intuitive, so players understand how to interact with it just by looking.',
        resources: [
            { title: 'Don Norman on Affordances and Signifiers - YouTube', url: 'https://www.youtube.com/watch?v=T-pv7o1gH6s' }
        ]
    },
    prospect_refuge: {
        name: 'Prospect & Refuge',
        icon: 'general',
        shortDescription: 'A design theory where players feel safe in a protected space (refuge) while having a clear view of the area ahead (prospect).',
        longDescription: 'Prospect-Refuge theory suggests that humans are drawn to spaces that offer both safety (refuge) and a clear view of the surrounding environment (prospect). In level design, this often translates to perches for snipers, safe rooms overlooking a dangerous area, or entrances to combat arenas that let the player survey the scene before engaging.',
        resources: []
    },
    weenie: {
        name: 'Weenie',
        icon: 'logo',
        shortDescription: 'A term coined by Walt Disney for a visually attractive landmark that draws guests deeper into a park.',
        longDescription: 'In level design, a "weenie" is a type of landmark that is not just for orientation, but is an enticing goal in itself. It\'s a visually interesting object or structure that the player sees from a distance and intrinsically wants to reach, effectively pulling them through the level. Cinderella\'s Castle is the most famous example.',
        resources: []
    },
    // Platformer
    skill_curve: {
        name: 'Skill Curve',
        icon: 'platformer',
        shortDescription: 'The rate at which a level or game demands increasing proficiency from the player.',
        longDescription: 'The skill curve represents how a level introduces, tests, and demands mastery of gameplay mechanics. A good curve introduces a concept in a safe environment, gradually adds complexity and pressure, and finally tests the player in a challenging scenario that combines it with other learned skills.',
        resources: []
    },
    // Puzzle
    solution_paths: {
        name: 'Solution Paths',
        icon: 'puzzle',
        shortDescription: 'The different ways a player can solve a puzzle, from a single intended solution to multiple creative approaches.',
        longDescription: 'Solution paths refer to the design of a puzzle\'s outcome. Some puzzles have a single, linear solution that the player must discover. Others might have multiple valid solutions, allowing for player creativity and expression. Designing for multiple solutions can make a puzzle more rewarding but is often more complex to implement.',
        resources: []
    },
    // Narrative
    environmental_storytelling: {
        name: 'Environmental Storytelling',
        icon: 'quote',
        shortDescription: 'Using the level\'s environment, props, and atmosphere to tell a story implicitly, without dialogue or text.',
        longDescription: 'Environmental storytelling is the art of telling a story through the game world itself. A hastily abandoned meal on a table, a skeleton reaching for a medkit, or a pristine room in an otherwise ruined building—all these scenes tell a story about what happened in that space before the player arrived.',
        resources: [
            { title: 'GDC: Environmental Storytelling in Gone Home', url: 'https://www.youtube.com/watch?v=ot96A51g_4k' }
        ]
    },
    // Psychology
    cognitive_load: {
        name: 'Cognitive Load',
        icon: 'horror',
        shortDescription: 'The total amount of mental effort being used in the player\'s working memory at any given time.',
        longDescription: 'Cognitive load refers to the mental bandwidth a player needs to track enemies, manage resources, solve a puzzle, and navigate. Designers must manage cognitive load carefully, providing moments of rest and focus to avoid overwhelming and frustrating the player.',
        resources: []
    },
};
