import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import { AnimeCardSkeleton } from '../components/SkeletonLoader';
import { animeAPI } from '../services/api';
import { FiGrid, FiChevronLeft, FiChevronRight, FiList, FiFilter } from 'react-icons/fi';

// TYPES INTERNAL
interface AllAnimeData {
  id: string;
  url: string;
  judul: string;
  cover: string;
  lastch?: string;
  lastup?: string;
  genre: string[];
  sinopsis?: string;
  studio?: string;
  score?: string;
  status?: string;
  rilis?: string;
  total_episode?: number;
}

const AllAnime: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = 24;

  const [animeList, setAnimeList] = useState<AllAnimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnime, setTotalAnime] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');

  const fetchAllAnime = useCallback(async () => {
    try {
      setLoading(true);
      // Untuk demo, kita akan menggunakan API search dengan query kosong
      // Atau jika API punya endpoint khusus untuk semua anime
      const response = await animeAPI.search('', page);
      
      if (response.data.data && response.data.data.length > 0) {
        const searchData = response.data.data[0];
        setAnimeList(searchData.result);
        setTotalPages(searchData.pagination.total_pages);
        setTotalAnime(searchData.pagination.total);
      } else {
        setAnimeList([]);
      }
    } catch (error) {
      console.error('Error fetching all anime:', error);
      // Fallback: Ambil dari latest jika search error
      try {
        const latestResponse = await animeAPI.getLatest(page);
        setAnimeList(latestResponse.data);
        setTotalPages(10); // Asumsi ada 10 halaman
        setTotalAnime(200); // Asumsi ada 200 anime
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setAnimeList([]);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAllAnime();
  }, [fetchAllAnime]);

  const handlePageChange = (newPage: number) => {
    navigate(`/all-anime?page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sortType: 'latest' | 'popular' | 'rating') => {
    setSortBy(sortType);
    // Di sini bisa tambahkan logic sorting
    // Untuk sekarang reset ke page 1
    navigate(`/all-anime?page=1`);
  };

  // Render pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`min-w-[40px] h-10 rounded-lg transition-all ${
            page === i
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 hover:bg-dark-700 text-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-colors"
        >
          <FiChevronLeft />
          <span>Previous</span>
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="min-w-[40px] h-10 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="min-w-[40px] h-10 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-colors"
        >
          <span>Next</span>
          <FiChevronRight />
        </button>
      </div>
    );
  };

  // List view component
  const ListViewItem = ({ anime, index }: { anime: AllAnimeData; index: number }) => (
    <div className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:bg-dark-700/50 transition-colors">
      <div className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden">
        <img
          src={anime.cover}
          alt={anime.judul}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/96x128/1e293b/94a3b8?text=Anime';
          }}
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-white hover:text-primary-400 transition-colors cursor-pointer">
          {anime.judul}
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {anime.score && (
            <div className="flex items-center gap-1 text-yellow-500">
              <FiGrid />
              <span className="font-medium">{anime.score}</span>
            </div>
          )}
          
          {anime.status && (
            <span className={`px-2 py-1 text-xs rounded ${
              anime.status === 'Ongoing' 
                ? 'bg-green-600/20 text-green-400'
                : 'bg-blue-600/20 text-blue-400'
            }`}>
              {anime.status}
            </span>
          )}
          
          {anime.rilis && (
            <span className="text-gray-400 text-sm">{anime.rilis}</span>
          )}
        </div>
        
        {anime.genre && anime.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {anime.genre.slice(0, 3).map((genre, idx) => (
              <span key={idx} className="px-2 py-1 text-xs bg-dark-700 rounded">
                {genre}
              </span>
            ))}
          </div>
        )}
        
        {anime.sinopsis && (
          <p className="text-gray-400 text-sm mt-3 line-clamp-2">
            {anime.sinopsis}
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <a
          href={`/anime/${encodeURIComponent(anime.url)}`}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/anime/${encodeURIComponent(anime.url)}`);
          }}
        >
          Watch
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">All Anime</h1>
              <p className="text-gray-400">
                Browse through our complete collection of anime
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  <FiList size={20} />
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="appearance-none bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 pl-10 pr-8 text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <FiGrid />
              <span>Total Anime: <span className="text-primary-400 font-semibold">{totalAnime.toLocaleString()}</span></span>
            </div>
            <div className="hidden md:block">•</div>
            <div>
              Page <span className="text-white font-semibold">{page}</span> of{' '}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>
            <div className="hidden md:block">•</div>
            <div>
              Showing <span className="text-white font-semibold">{animeList.length}</span> anime
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : animeList.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {animeList.map((anime, index) => (
                  <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {animeList.map((anime, index) => (
                  <ListViewItem key={`${anime.id}-${index}`} anime={anime} index={index} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12">
              {renderPagination()}
              
              {/* Quick Page Jump */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-gray-400">Go to page:</span>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    defaultValue={page}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const newPage = Math.max(1, Math.min(totalPages, parseInt(input.value) || 1));
                        handlePageChange(newPage);
                      }
                    }}
                    className="w-20 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                      if (input) {
                        const newPage = Math.max(1, Math.min(totalPages, parseInt(input.value) || 1));
                        handlePageChange(newPage);
                      }
                    }}
                    className="ml-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-800 flex items-center justify-center">
              <FiGrid className="text-gray-500 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No Anime Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              We couldn't find any anime in our database. Please try again later.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Page Info Footer */}
        {!loading && animeList.length > 0 && (
          <div className="mt-12 pt-6 border-t border-dark-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
              <div>
                Showing {(page - 1) * perPage + 1} to{' '}
                {Math.min(page * perPage, totalAnime)} of {totalAnime.toLocaleString()} anime
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                  <span>New Releases</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span>Ongoing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAnime;
