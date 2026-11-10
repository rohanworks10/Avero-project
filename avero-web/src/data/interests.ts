export type InterestId =
  | "food"
  | "heritage"
  | "nature"
  | "adventure"
  | "shopping"
  | "nightlife"
  | "wellness"
  | "art-culture";

export type Interest = {
  id: InterestId;
  label: string;
  icon: string;
};

export const interests: readonly Interest[] = [
  { id: "food", label: "Food", icon: "Utensils" },
  { id: "heritage", label: "Heritage", icon: "Landmark" },
  { id: "nature", label: "Nature", icon: "Trees" },
  { id: "adventure", label: "Adventure", icon: "Compass" },
  { id: "shopping", label: "Shopping", icon: "ShoppingBag" },
  { id: "nightlife", label: "Nightlife", icon: "Wine" },
  { id: "wellness", label: "Wellness", icon: "Sparkles" },
  { id: "art-culture", label: "Art & Culture", icon: "Palette" },
] as const;

export const interestMap: Record<InterestId, Interest> = interests.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<InterestId, Interest>
);

export function getInterestById(id: string): Interest | undefined {
  return interests.find((item) => item.id === id);
}

export function isValidInterestId(id: string): id is InterestId {
  return interests.some((item) => item.id === id);
}

