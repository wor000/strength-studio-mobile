import { supabase } from '@/integrations/supabase/client';

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
  url: string;
}

interface CacheEntry {
  url: string;
  timestamp: number;
}

// Cache local com TTL de 24 horas
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas em ms
const videoCache = new Map<string, CacheEntry>();

export const youtubeService = {
  async searchVideo(exerciseName: string): Promise<string | null> {
    try {
      // Normalizar chave do cache
      const cacheKey = exerciseName.toLowerCase().trim();
      
      // Verificar cache primeiro
      const cached = videoCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log('Cache hit for:', exerciseName);
        return cached.url;
      }

      console.log('Cache miss, searching YouTube for:', exerciseName);
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query: exerciseName, maxResults: 1 }
      });

      if (error) {
        console.error('Error searching YouTube:', error);
        return null;
      }

      const videos: YouTubeVideo[] = data?.videos || [];
      if (videos.length > 0) {
        const videoUrl = videos[0].url;
        
        // Salvar no cache
        videoCache.set(cacheKey, {
          url: videoUrl,
          timestamp: Date.now()
        });
        
        // Limpar cache antigo (máximo 100 entradas)
        if (videoCache.size > 100) {
          const oldestKey = videoCache.keys().next().value;
          videoCache.delete(oldestKey);
        }
        
        console.log('Found and cached YouTube video:', videoUrl);
        return videoUrl;
      }

      return null;
    } catch (error) {
      console.error('Error in YouTube search:', error);
      return null;
    }
  },

  // Método para limpar cache manualmente
  clearCache() {
    videoCache.clear();
    console.log('YouTube cache cleared');
  },

  // Método para verificar estatísticas do cache
  getCacheStats() {
    return {
      size: videoCache.size,
      entries: Array.from(videoCache.entries()).map(([key, value]) => ({
        exercise: key,
        cached: new Date(value.timestamp).toISOString(),
        url: value.url
      }))
    };
  }
};
