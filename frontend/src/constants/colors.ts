/** Definition for a predefined color option. */
export interface ColorDefinition {
  /** Unique identifier (e.g., "blue", "red"). */
  id: string;
  /** Human-readable label (e.g., "Blue", "Red"). */
  label: string;
  /** Hex color value for backgrounds/accents. */
  hex: string;
  /** Text color that meets WCAG AA contrast on this background. */
  textColor: string;
}

/** The 6 predefined colors available for player profiles (WCAG AA, CVD-safe). */
export const COLORS: readonly ColorDefinition[] = [
  { id: 'red', label: 'Red', hex: '#D32F2F', textColor: '#FFFFFF' },
  { id: 'gold', label: 'Gold', hex: '#F9A825', textColor: '#1A1A1A' },
  { id: 'teal', label: 'Teal', hex: '#00796B', textColor: '#FFFFFF' },
  { id: 'blue', label: 'Blue', hex: '#1565C0', textColor: '#FFFFFF' },
  { id: 'purple', label: 'Purple', hex: '#6A1B9A', textColor: '#FFFFFF' },
  { id: 'pink', label: 'Pink', hex: '#C2185B', textColor: '#FFFFFF' },
] as const;

/** Default color ID (first in the list). */
export const DEFAULT_COLOR_ID = COLORS[0].id;
