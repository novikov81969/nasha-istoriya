export function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
      {muted ? (
        <path
          d="M16 9.5 21 15m0-5.5L16 15"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <>
          <path
            d="M15.4 9.4a3.6 3.6 0 0 1 0 5.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M17.9 7a7 7 0 0 1 0 10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity=".7"
          />
        </>
      )}
    </svg>
  );
}

export function ExpandIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {collapsed ? (
          <>
            <path d="M9 4v5H4" />
            <path d="M15 20v-5h5" />
            <path d="M20 9h-5V4" />
            <path d="M4 15h5v5" />
          </>
        ) : (
          <>
            <path d="M4 9V4h5" />
            <path d="M20 15v5h-5" />
            <path d="M15 4h5v5" />
            <path d="M9 20H4v-5" />
          </>
        )}
      </g>
    </svg>
  );
}
