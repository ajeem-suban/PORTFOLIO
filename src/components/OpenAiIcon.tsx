interface OpenAiIconProps {
  size?: number
  color?: string
}

/**
 * Minimal OpenAI "knot" logomark, drawn as plain SVG so the AI Toolkit hub
 * can show ChatGPT's real symbol instead of a generic bot icon — the
 * react-icons/si bundle in this project doesn't ship SiOpenai/SiChatgpt.
 */
export default function OpenAiIcon({ size = 24, color = "currentColor" }: OpenAiIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        fill={color}
        d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.9 6.05 6.05 0 0 0-6.5-2.9A6 6 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.9 6.05 6.05 0 0 0 6.5 2.9A6 6 0 0 0 19.02 19.8a5.98 5.98 0 0 0 4-2.9 6.05 6.05 0 0 0-.74-7.08ZM13.4 21.4a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.79-2.77a.78.78 0 0 0 .39-.68v-6.75l2.02 1.17a.07.07 0 0 1 .04.06v5.6a4.5 4.5 0 0 1-4.5 4.5ZM3.85 17.3a4.47 4.47 0 0 1-.54-3.02l.14.08 4.79 2.77a.78.78 0 0 0 .78 0l5.85-3.38v2.33a.08.08 0 0 1-.03.07l-4.84 2.8a4.5 4.5 0 0 1-6.15-1.65ZM2.6 7.85a4.48 4.48 0 0 1 2.36-1.97v5.69a.77.77 0 0 0 .39.67l5.84 3.38-2.02 1.17a.08.08 0 0 1-.07 0L3.87 14a4.5 4.5 0 0 1-1.27-6.15Zm16.63 3.87-5.85-3.39L15.4 7.16a.08.08 0 0 1 .07 0l4.85 2.8a4.5 4.5 0 0 1-.68 8.11v-5.68a.79.79 0 0 0-.39-.67Zm2.01-3.03-.14-.08-4.79-2.77a.78.78 0 0 0-.78 0l-5.85 3.38V6.9a.07.07 0 0 1 .03-.07l4.84-2.79a4.5 4.5 0 0 1 6.69 4.65ZM8.7 12.85l-2.02-1.17a.07.07 0 0 1-.04-.06v-5.6a4.5 4.5 0 0 1 7.38-3.46l-.14.08-4.79 2.77a.78.78 0 0 0-.39.68v6.75Zm1.1-2.38 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5v-3Z"
      />
    </svg>
  )
}
