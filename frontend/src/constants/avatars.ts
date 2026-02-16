/** Definition for a predefined avatar option. */
export interface AvatarDefinition {
  /** Unique identifier (e.g., "cat", "rocket"). */
  id: string;
  /** Translation key for the human-readable label. */
  labelKey: string;
  /** Translation key for the accessibility description. */
  descriptionKey: string;
}

/** The 8 predefined avatars available for player profiles. */
export const AVATARS: readonly AvatarDefinition[] = [
  { id: 'rocket', labelKey: 'avatar.rocket', descriptionKey: 'avatar.rocketDesc' },
  { id: 'star', labelKey: 'avatar.star', descriptionKey: 'avatar.starDesc' },
  { id: 'cat', labelKey: 'avatar.cat', descriptionKey: 'avatar.catDesc' },
  { id: 'turtle', labelKey: 'avatar.turtle', descriptionKey: 'avatar.turtleDesc' },
  { id: 'robot', labelKey: 'avatar.robot', descriptionKey: 'avatar.robotDesc' },
  { id: 'dinosaur', labelKey: 'avatar.dinosaur', descriptionKey: 'avatar.dinosaurDesc' },
  { id: 'unicorn', labelKey: 'avatar.unicorn', descriptionKey: 'avatar.unicornDesc' },
  { id: 'lightning', labelKey: 'avatar.lightning', descriptionKey: 'avatar.lightningDesc' },
] as const;

/** Default avatar ID (first in the list). */
export const DEFAULT_AVATAR_ID = AVATARS[0].id;
