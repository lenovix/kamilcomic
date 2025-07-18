// Utilitas untuk bookmark dan rating komik menggunakan localStorage
export function getBookmarks(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('comic_bookmarks');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setBookmarks(bookmarks: number[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('comic_bookmarks', JSON.stringify(bookmarks));
}

export function toggleBookmark(slug: number) {
  const bookmarks = getBookmarks();
  if (bookmarks.includes(slug)) {
    setBookmarks(bookmarks.filter((s) => s !== slug));
  } else {
    setBookmarks([...bookmarks, slug]);
  }
}

export function isBookmarked(slug: number): boolean {
  return getBookmarks().includes(slug);
}

// Rating komik: simpan rating per slug di localStorage
export function getRating(slug: number): number {
  if (typeof window === 'undefined') return 0;
  try {
    const data = localStorage.getItem('comic_rating_' + slug);
    return data ? Number(data) : 0;
  } catch {
    return 0;
  }
}

export function setRating(slug: number, rating: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('comic_rating_' + slug, String(rating));
}

// Untuk rata-rata rating (dummy, karena tanpa backend, hanya rating user sendiri)
export function getAverageRating(slug: number): number {
  return getRating(slug);
}
