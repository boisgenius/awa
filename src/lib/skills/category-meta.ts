// Category metadata and gradients

export const categoryMeta: Record<string, { label: string; emoji: string }> = {
  research: { label: 'Research', emoji: '🔬' },
  finance: { label: 'Finance', emoji: '📈' },
  coding: { label: 'Coding', emoji: '💻' },
  security: { label: 'Security', emoji: '🛡️' },
  creative: { label: 'Creative', emoji: '🎨' },
  comms: { label: 'Comms', emoji: '✉️' },
};

export const categoryGradients: Record<string, string> = {
  research: 'linear-gradient(135deg, #E40F3A, #770524)',
  finance: 'linear-gradient(135deg, #00FF88, #00CC6A)',
  coding: 'linear-gradient(135deg, #7C3AED, #A855F7)',
  security: 'linear-gradient(135deg, #FF6B00, #FF8533)',
  creative: 'linear-gradient(135deg, #FFD93D, #FFC107)',
  comms: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
};
