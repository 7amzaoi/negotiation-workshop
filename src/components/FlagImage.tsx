const EMOJI_TO_CODE: Record<string, string> = {
  '🇹🇷': 'tr',
  '🇩🇪': 'de',
  '🇫🇷': 'fr',
  '🇺🇸': 'us',
  '🇮🇹': 'it',
  '🇪🇸': 'es',
  '🇯🇵': 'jp',
  '🇨🇳': 'cn',
  '🇬🇧': 'gb',
  '🇨🇦': 'ca',
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
  const code = EMOJI_TO_CODE[emoji]
  const { width, imgWidth } = SIZES[size]

  if (!code) {
    return <span className={`ltr-safe ${className}`} style={{ fontSize: width * 0.7 }}>{emoji}</span>
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
  return EMOJI_TO_CODE[emoji] || ''
}
