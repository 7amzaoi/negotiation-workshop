// Known emoji → ISO code
const EMOJI_TO_CODE: Record<string, string> = {
  '🇺🇸': 'us', '🇷🇺': 'ru', '🇸🇾': 'sy', '🇮🇶': 'iq',
  '🇮🇱': 'il', '🇮🇷': 'ir', '🇹🇷': 'tr', '🇸🇦': 'sa',
  '🇱🇧': 'lb', '🇩🇪': 'de', '🇫🇷': 'fr', '🇮🇹': 'it',
  '🇪🇸': 'es', '🇯🇵': 'jp', '🇨🇳': 'cn', '🇬🇧': 'gb',
  '🇨🇦': 'ca',
}

// Flag emojis are made of Regional Indicator pairs (U+1F1E6..U+1F1FF).
// Extract the 2-letter ISO code automatically from any flag emoji.
function flagEmojiToCode(emoji: string): string | null {
  const codePoints = [...emoji].map(c => c.codePointAt(0) || 0)
  const regionIndicators = codePoints.filter(cp => cp >= 0x1F1E6 && cp <= 0x1F1FF)
  if (regionIndicators.length === 2) {
    return String.fromCharCode(regionIndicators[0] - 0x1F1E6 + 65, regionIndicators[1] - 0x1F1E6 + 65).toLowerCase()
  }
  return null
}

function resolveCode(emoji: string): string | null {
  // Direct lookup
  if (EMOJI_TO_CODE[emoji]) return EMOJI_TO_CODE[emoji]
  // Auto-extract from any flag emoji
  const extracted = flagEmojiToCode(emoji)
  if (extracted) return extracted
  // Try as 2-letter text (Windows renders flag emoji as e.g. "US", "RU")
  const trimmed = emoji.trim().toUpperCase()
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed.toLowerCase()
  return null
}

interface FlagImageProps {
  emoji: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: { width: 24, imgWidth: 40 },
  md: { width: 36, imgWidth: 80 },
  lg: { width: 52, imgWidth: 80 },
  xl: { width: 72, imgWidth: 160 },
}

export function FlagImage({ emoji, size = 'md', className = '' }: FlagImageProps) {
  const code = resolveCode(emoji)
  const { width, imgWidth } = SIZES[size]

  // QSD (قسد / SDF) — use local flag
  if (!code) {
    return (
      <img
        src="/flags/qsd.png"
        alt={emoji || 'قسد'}
        width={width}
        className={`rounded-sm object-cover shadow-sm ${className}`}
        style={{ aspectRatio: '4/3' }}
        loading="lazy"
      />
    )
  }

  return (
    <img
      src={`https://flagcdn.com/w${imgWidth}/${code}.png`}
      srcSet={`https://flagcdn.com/w${imgWidth * 2}/${code}.png 2x`}
      alt={emoji}
      width={width}
      className={`rounded-sm object-cover shadow-sm ${className}`}
      style={{ aspectRatio: '4/3' }}
      loading="lazy"
    />
  )
}

export function getCountryCode(emoji: string): string {
  return resolveCode(emoji) || ''
}
