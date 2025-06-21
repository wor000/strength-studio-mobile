
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
  url: string;
}

interface YouTubeSearchRequest {
  query: string;
  maxResults?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 5 }: YouTubeSearchRequest = await req.json();
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

    // Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query + ' tutorial exercício')}&maxResults=${maxResults}&key=${apiKey}&relevanceLanguage=pt&regionCode=BR`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchData.error?.message || 'Unknown error'}`);
    }

    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',');
    
    if (!videoIds) {
      return new Response(JSON.stringify({ videos: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get video details including duration and embeddable status
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,status&id=${videoIds}&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    // Filter only embeddable videos and map to our format
    const videos: YouTubeVideo[] = detailsData.items
      ?.filter((item: any) => item.status?.embeddable === true)
      ?.map((item: any) => ({
        videoId: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        duration: formatDuration(item.contentDetails.duration),
        url: `https://www.youtube.com/watch?v=${item.id}`
      })) || [];

    console.log(`Found ${detailsData.items?.length || 0} videos, ${videos.length} are embeddable`);

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  let formatted = '';
  if (hours) formatted += `${hours}:`;
  formatted += `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  
  return formatted;
}
