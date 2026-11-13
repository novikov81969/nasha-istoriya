// ============================================================
//  МУЗЫКА
//  Положите песню в папку src/music/ — она подхватится сама,
//  менять код не нужно. Поддерживаются mp3, m4a, aac, ogg, wav, flac.
//  Если файлов несколько, играет первый по алфавиту.
// ============================================================

const files = import.meta.glob('./music/*.{mp3,m4a,aac,ogg,oga,wav,flac}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const sorted = Object.keys(files).sort((a, b) => a.localeCompare(b));

/** Ссылка на песню из папки src/music/ (или null, если папка пуста). */
export const musicSrc: string | null = sorted.length > 0 ? files[sorted[0]] : null;
