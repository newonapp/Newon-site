/**
 * Newon Labs — experiments registry (admin / legacy).
 * Public detail data lives in lab-experiments.mjs.
 */
export const LABS_STATUS = ["exploring", "building", "beta", "live", "paused"];

export const LABS_EXPERIMENTS = [
  {
    id: "review-ai",
    slug: "review-ai",
    status: "building",
    nameKey: "studio.lab1Name",
    descKey: "studio.lab1Desc",
    type: "ai",
  },
  {
    id: "newon-qr",
    slug: "newon-qr",
    status: "building",
    nameKey: "studio.lab2Name",
    descKey: "studio.lab2Desc",
    type: "saas",
  },
  {
    id: "newon-form",
    slug: "newon-form",
    status: "concept",
    nameKey: "studio.lab3Name",
    descKey: "studio.lab3Desc",
    type: "saas",
  },
  {
    id: "ai-experiment",
    slug: "ai-experiment",
    status: "exploring",
    nameKey: "studio.lab4Name",
    descKey: "studio.lab4Desc",
    type: "ai",
  },
  {
    id: "game-experiment",
    slug: "game-experiment",
    status: "exploring",
    nameKey: "studio.lab5Name",
    descKey: "studio.lab5Desc",
    type: "games",
  },
  {
    id: "character-lab",
    slug: "character-lab",
    status: "building",
    nameKey: "studio.lab6Name",
    descKey: "studio.lab6Desc",
    type: "character",
  },
];
