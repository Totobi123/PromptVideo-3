const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = "https://api.pexels.com/v1";
const PEXELS_VIDEO_API_URL = "https://api.pexels.com/videos";

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large: string;
    medium: string;
  };
}

interface PexelsVideo {
  id: number;
  image: string;
  video_files: Array<{
    link: string;
    quality: string;
  }>;
}

export async function searchPexelsMedia(query: string, type: "image" | "video"): Promise<{ url: string; thumbnail: string }> {
  if (!PEXELS_API_KEY) {
    throw new Error("PEXELS_API_KEY is not configured");
  }

  try {
    if (type === "image") {
      const response = await fetch(`${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: {
          "Authorization": PEXELS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      const photo: PexelsPhoto = data.photos?.[0];

      if (!photo) {
        // Return a placeholder if no results
        return {
          url: "",
          thumbnail: "",
        };
      }

      return {
        url: photo.src.large,
        thumbnail: photo.src.medium,
      };
    } else {
      const response = await fetch(`${PEXELS_VIDEO_API_URL}/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: {
          "Authorization": PEXELS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels Video API error: ${response.status}`);
      }

      const data = await response.json();
      const video: PexelsVideo = data.videos?.[0];

      if (!video) {
        return {
          url: "",
          thumbnail: "",
        };
      }

      const videoFile = video.video_files.find(f => f.quality === "hd") || video.video_files[0];

      return {
        url: videoFile.link,
        thumbnail: video.image,
      };
    }
  } catch (error) {
    console.error("Error fetching Pexels media:", error);
    // Return empty on error to allow the app to continue
    return {
      url: "",
      thumbnail: "",
    };
  }
}
