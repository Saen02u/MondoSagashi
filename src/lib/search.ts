import { Video, TagWithCount } from '../types/video';

/**
 * Filter videos based on search query (title, channel, description, tags)
 * and selected tags.
 */
export function filterVideos(
  videos: Video[],
  searchQuery: string,
  selectedTags: string[]
): Video[] {
  const query = searchQuery.trim().toLowerCase();

  return videos.filter((video) => {
    // 1. Tag filtering (video must contain all selected tags)
    if (selectedTags.length > 0) {
      const hasAllTags = selectedTags.every((tag) =>
        video.tags.some((vt) => vt.toLowerCase() === tag.toLowerCase())
      );
      if (!hasAllTags) {
        return false;
      }
    }

    // 2. Query search across title, channelName, description, and tags
    if (!query) {
      return true;
    }

    const titleMatch = video.title.toLowerCase().includes(query);
    const channelMatch = video.channelName.toLowerCase().includes(query);
    const descMatch = video.description.toLowerCase().includes(query);
    const tagMatch = video.tags.some((tag) =>
      tag.toLowerCase().includes(query)
    );

    return titleMatch || channelMatch || descMatch || tagMatch;
  });
}

/**
 * Extract all unique tags and count their occurrences across all videos.
 * Sorted by count descending, then alphabetically.
 */
export function getTagsWithCounts(videos: Video[]): TagWithCount[] {
  const countMap = new Map<string, number>();

  for (const video of videos) {
    for (const tag of video.tags) {
      countMap.set(tag, (countMap.get(tag) || 0) + 1);
    }
  }

  const result: TagWithCount[] = [];
  for (const [name, count] of countMap.entries()) {
    result.push({ name, count });
  }

  return result.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });
}
