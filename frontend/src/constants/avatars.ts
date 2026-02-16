/** Definition for a predefined avatar option. */
export interface AvatarDefinition {
  /** Unique identifier (e.g., "cat", "rocket"). */
  id: string;
  /** Human-readable label for display and aria-label. */
  label: string;
  /** Short description for accessibility. */
  description: string;
}

/** The 8 predefined avatars available for player profiles. */
export const AVATARS: readonly AvatarDefinition[] = [
  { id: 'rocket', label: 'Rocket', description: 'A flying rocket ship' },
  { id: 'star', label: 'Star', description: 'A shining star' },
  { id: 'cat', label: 'Cat', description: 'A friendly cat face' },
  { id: 'turtle', label: 'Turtle', description: 'A smiling turtle' },
  { id: 'robot', label: 'Robot', description: 'A cute robot' },
  { id: 'dinosaur', label: 'Dinosaur', description: 'A friendly dinosaur' },
  { id: 'unicorn', label: 'Unicorn', description: 'A magical unicorn' },
  { id: 'lightning', label: 'Lightning', description: 'A lightning bolt' },
] as const;

/** Default avatar ID (first in the list). */
export const DEFAULT_AVATAR_ID = AVATARS[0].id;
