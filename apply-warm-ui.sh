#!/bin/bash

# Update globals.css
cat > app/globals.css << 'EOF'
@import "tailwindcss";

:root {
  --background: #FAF7F2;
  --foreground: #4A3F35;
  --royal-cream: #FAF7F2;
  --royal-beige: #F5EFE6;
  --royal-stone: #E8DCC8;
  --royal-brown: #5C4A3A;
  --royal-espresso: #4A3F35;
  --royal-taupe: #8B7355;
  --crown-terracotta: #D2691E;
  --crown-clay: #C65D3B;
  --crown-sunset: #E47A3B;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #FAF7F2;
    --foreground: #4A3F35;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--royal-cream);
}

::-webkit-scrollbar-thumb {
  background: var(--royal-taupe);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--crown-terracotta);
}

/* Smooth Transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
EOF

echo "✓ Updated globals.css"

