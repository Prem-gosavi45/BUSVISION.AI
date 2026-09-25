export function useTheme() {
  const isDark = typeof window !== 'undefined' && localStorage.getItem('bv_theme') === 'dark';
  return { isDark };
}
