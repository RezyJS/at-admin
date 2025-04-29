export default function getShortText(str: string, length: number = 50): string {
  if (!str) return '';

  if (str.length <= 50) {
    return str;
  }

  return str.slice(0, Math.min(str.length, length)) + '...';
}
