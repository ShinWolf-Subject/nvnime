import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { animeAPI } from '../services/api';
import { 
  FiPlay, 
  FiCalendar, 
  FiStar, 
  FiTag, 
  FiTv,
  FiChevronLeft,
  FiHome,
  FiAlertCircle,
  FiList
} from 'react-icons/fi';
import { EpisodeSkeleton } from '../components/SkeletonLoader';

// TYPES INTERNAL untuk AnimeDetail
interface AnimeDetailChapter {
  id: number;
  ch: string;
  url: string;
  date: string;
  history: string;
  lastDurasi: number | null;
  fullDurasi: number | null;
}

interface AnimeDetailVideoStream {
  reso: string;
  link: string;
  provide: number;
  id: number;
}

interface AnimeDetailVideoData {
  episode_id: number;
  likeCount: number;
  dislikeCount: number;
  userLikeStatus: number;
  reso: string[];
  stream: AnimeDetailVideoStream[];
}

interface AnimeDetailData {
  id: number;
  series_id: string;
  bookmark: string | null;
  cover: string;
  judul: string;
  type: string;
  countdown: string | null;
  status: string;
  rating: string;
  published: string;
  author: string;
  genre: string[];
  genreurl: string[];
  sinopsis: string;
  history: string[];
  historyDurasi: number[];
  historyDurasiFull: number[];
  chapter: AnimeDetailChapter[];
}

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnimeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeDetailChapter | null>(null);
  const [videoData, setVideoData] = useState<AnimeDetailVideoData | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('720p');

  // Decode URL parameter
  const decodedId = id ? decodeURIComponent(id) : '';

  const fetchVideo = useCallback(async (chapterUrlId: string) => {
    try {
      const response = await animeAPI.getVideo(chapterUrlId, selectedQuality);
      if (response.data.data && response.data.data.length > 0) {
        setVideoData(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  }, [selectedQuality]);

  const fetchAnimeDetail = useCallback(async () => {
    if (!decodedId) {
      setError('ID anime tidak valid');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Clean the URL ID
      const cleanUrlId = decodedId.split('?')[0].trim();
      
      console.log('Fetching anime detail for:', cleanUrlId);
      
      const response = await animeAPI.getDetail(cleanUrlId);
      
      if (response.data.data && response.data.data.length > 0) {
        const animeData = response.data.data[0];
        setAnime(animeData);
        
        if (animeData.chapter && animeData.chapter.length > 0) {
          setSelectedEpisode(animeData.chapter[0]);
          fetchVideo(animeData.chapter[0].url);
        } else {
          setError('Tidak ada episode tersedia untuk anime ini');
        }
      } else {
        setError('Anime tidak ditemukan');
        setAnime(null);
      }
    } catch (err) {
      console.error('Error fetching anime detail:', err);
      setError('Gagal memuat detail anime. Silakan coba lagi.');
      setAnime(null);
    } finally {
      setLoading(false);
    }
  }, [decodedId, fetchVideo]);

  useEffect(() => {
    fetchAnimeDetail();
  }, [fetchAnimeDetail]);

  const handleEpisodeSelect = (episode: AnimeDetailChapter) => {
    setSelectedEpisode(episode);
    fetchVideo(episode.url);
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    if (selectedEpisode) {
      fetchVideo(selectedEpisode.url);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 pt-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <FiChevronLeft />
            <span>Kembali ke Beranda</span>
          </Link>
          
          <div className="animate-pulse">
            <div className="skeleton h-12 w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="skeleton aspect-[2/3] rounded-xl"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton h-6 w-1/2"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 mb-8"
          >
            <FiChevronLeft />
            <span>Kembali ke Beranda</span>
          </Link>
          
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <FiAlertCircle className="text-red-500 text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Oops!</h2>
            <p className="text-gray-300 text-lg mb-2">{error}</p>
            <p className="text-gray-400 mb-8">
              Anime dengan ID "{decodedId}" tidak dapat ditemukan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg font-medium transition-colors"
              >
                Kembali
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2"
              >
                <FiHome />
                <span>Ke Beranda</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Anime not found
  if (!anime) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Anime tidak ditemukan</h2>
          <Link to="/" className="text-primary-400 hover:text-primary-300">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
      {/*
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiChevronLeft />
          <span>Kembali ke Beranda</span>
        </Link> */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiChevronLeft />
          <span>Kembali</span>
        </button>
      </div>


      <div className="container mx-auto px-4 py-8">
        {/* Anime Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="sticky top-24"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-dark-700">
                <img
                  src={anime.cover}
                  alt={anime.judul}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x600/1e293b/94a3b8?text=Anime+Cover';
                  }}
                />
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 flex flex-col gap-3">
                {anime.rating && (
                  <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700">
                    <span className="text-gray-400">Rating</span>
                    <div className="flex items-center space-x-1">
                      <FiStar className="text-yellow-500" />
                      <span className="font-bold text-lg">{anime.rating}</span>
                    </div>
                  </div>
                )}
                
                {anime.status && (
                  <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-medium ${
                      anime.status === 'Ongoing' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {anime.status}
                    </span>
                  </div>
                )}
                
                {anime.type && (
                  <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700">
                    <span className="text-gray-400">Type</span>
                    <span className="font-medium">{anime.type}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{anime.judul}</h1>
              
              {/* Quick Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                {anime.published && (
                  <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg border border-dark-700">
                    <FiCalendar className="text-gray-400" />
                    <span>{anime.published}</span>
                  </div>
                )}
                
                {anime.author && (
                  <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg border border-dark-700">
                    <FiTag className="text-gray-400" />
                    <span>{anime.author}</span>
                  </div>
                )}
                
                {anime.chapter && (
                  <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg border border-dark-700">
                    <FiList className="text-gray-400" />
                    <span>{anime.chapter.length} Episode</span>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-white">Sinopsis</h3>
                <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {anime.sinopsis || 'Tidak ada sinopsis tersedia.'}
                  </p>
                </div>
              </div>

              {/* Genres */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 text-white">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-primary-900/30 to-purple-900/30 border border-primary-700 rounded-lg hover:bg-primary-800/50 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Video Player Section */}
        {selectedEpisode && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Episode {selectedEpisode.ch}
              {selectedEpisode.date && (
                <span className="text-gray-400 text-lg font-normal ml-3">
                  • {selectedEpisode.date}
                </span>
              )}
            </h2>
            
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden mb-6 border border-dark-700">
              {videoData && videoData.stream.length > 0 ? (
                <div className="aspect-video">
                  <video
                    key={videoData.stream[0].link}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full"
                    poster={anime.cover}
                  >
                    <source src={videoData.stream[0].link} type="video/mp4" />
                    Browser Anda tidak mendukung pemutar video.
                  </video>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 to-black">
                  <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4 bg-gray-400 text-white"></div>
                  <p className="text-gray-400">Memuat video...</p>
                </div>
              )}
            </div>

            {/* Quality Selector */}
            {videoData && videoData.reso.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                <span className="text-gray-400 font-medium">Kualitas:</span>
                <div className="flex flex-wrap gap-2">
                  {videoData.reso.map((reso) => (
                    <button
                      key={reso}
                      onClick={() => handleQualityChange(reso)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedQuality === reso
                          ? 'bg-primary-600'
                          : 'bg-dark-700 hover:bg-dark-600'
                      }`}
                    >
                      {reso}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Episode List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Daftar Episode</h2>
            {anime.chapter && (
              <span className="text-gray-400">
                {anime.chapter.length} Episode
              </span>
            )}
          </div>
          
          {anime.chapter && anime.chapter.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {anime.chapter.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedEpisode?.id === episode.id
                      ? 'bg-gradient-to-r from-blue-400 to-sky-600'
                      : 'bg-dark-800/50 hover:bg-dark-700 border border-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">
                      Episode {episode.ch}
                    </span>
                    <FiPlay className={
                      selectedEpisode?.id === episode.id 
                        ? 'text-white' 
                        : 'text-primary-400'
                    } />
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {episode.date || 'Tanggal tidak tersedia'}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-dark-800/30 rounded-2xl border border-dashed border-dark-700">
              <FiTv className="text-gray-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-400">Tidak ada episode tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
