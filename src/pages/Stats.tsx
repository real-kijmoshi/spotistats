import { useEffect, useState, useRef } from "react";
import api from "../../utils/spotify";
import { 
    Play, Pause, Clock, BarChart2, Music, User, Share2, Award, TrendingUp
} from "lucide-react";
import SpotiStatsLogoTransparent from "../assets/logo-transparent.png";

// Types
interface Track {
  album: {
    images: { height: number; url: string; width: number }[];
    name: string;
    release_date: string;
  };
  artists: { 
    name: string; 
    id: string;
    genres?: string[];
    external_urls?: { spotify: string };
  }[];
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  popularity: number;
  preview_url: string;
  uri: string;
  is_playable: boolean;
}

interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { height: number; url: string; width: number }[];
  popularity: number;
  external_urls: { spotify: string };
  followers: { total: number };
}

interface User {
  display_name: string;
  images: { url: string }[];
  country: string;
  followers: { total: number };
  product: string;
}

interface Insights {
    topGenres: { genre: string; count: number }[];
    avgPopularity: number;
    decades: [string, number][];
    explicitTracks: number;
    totalDuration: number;
}

// Helper functions
const normalizeTimePeriod = (period: string) => {
  switch (period) {
    case "short_term":
      return "Last 4 weeks";
    case "medium_term":
      return "Last 6 months";
    case "long_term":
      return "All time";
    default:
      return "Last 4 weeks";
  }
};

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};



export default function Stats() {
  // State variables
  const [user, setUser] = useState<User | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [period, setPeriod] = useState<"short_term" | "medium_term" | "long_term">("short_term");
  const [currentTab, setCurrentTab] = useState<"tracks" | "artists" | "insights">("tracks");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<Track | Artist | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [limit, setLimit] = useState<number>(50);


  const audioRef = useRef<HTMLAudioElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await api.me();
        setUser(userData);
        
        // Fetch tracks and artists in parallel
        const [tracksData, artistsData] = await Promise.all([
          api.getTracks(period, limit),
          api.getTopArtists(period, limit),
        ]);
        
        setTracks(tracksData);
        setArtists(artistsData);

        
        console.log("Tracks:", tracksData);

        // Generate insights
        generateInsights(tracksData, artistsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, limit]);


  // Generate insights
  const generateInsights = (tracks: Track[], artists: Artist[]) => {
    // Skip if data is not available
    if (!tracks.length || !artists.length) return;

    // Calculate genre distribution
    const genres: {[key: string]: number} = {};
    artists.forEach(artist => {
      artist.genres?.forEach(genre => {
        genres[genre] = (genres[genre] || 0) + 1;
      });
    });

    // Sort genres by frequency
    const topGenres = Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Calculate average popularity
    const avgPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length;

    // Calculate decade distribution
    const decades: {[key: string]: number} = {};
    tracks.forEach(track => {
      if (track.album.release_date) {
        const year = parseInt(track.album.release_date.substring(0, 4));
        const decade = `${Math.floor(year / 10) * 10}s`;
        decades[decade] = (decades[decade] || 0) + 1;
      }
    });

    // Set insights
    setInsights({
      topGenres,
      avgPopularity: Math.round(avgPopularity),
      decades: Object.entries(decades).sort((a, b) => parseInt(a[0]) - parseInt(b[0])),
      explicitTracks: tracks.filter(track => track.explicit).length,
      totalDuration: tracks.reduce((sum, track) => sum + track.duration_ms, 0),
    });
  };

  // Scroll handler for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        setIsSticky(window.scrollY > 10);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Audio player handler
  const togglePlay = async (track: Track) => {
    console.log("Toggling play for track:", track.name);
    const trackInfo = await api.getTrackById(track.id, user?.country || "US");
    console.log("Track Info", trackInfo);


    if (audioRef.current) {
      if (currentTrack === track.id) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } else {
        audioRef.current.src = trackInfo.preview_url;
        audioRef.current.play();
        setCurrentTrack(track.id);
        setIsPlaying(true);
      }
    }
  };

  // View details modal
  const openDetailsModal = (item: Track | Artist) => {
    setModalContent(item);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div 
        ref={headerRef}
        className={`sticky top-0 z-50 flex justify-between items-center p-5 ${
          isSticky 
            ? "bg-black bg-opacity-80 backdrop-blur-lg shadow-lg"
            : "bg-gradient-to-r from-gray-900 via-black to-gray-900"
        } transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src={SpotiStatsLogoTransparent}
            alt="SpotiStats"
            className="w-52 h-52 absolute"
            />
        </div>

        {/* Navigation */}
        <div className="hidden md:flex space-x-6">
          <button 
            onClick={() => setCurrentTab("tracks")} 
            className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              currentTab === "tracks" ? "bg-green-500 text-black" : "text-gray-300 hover:text-white"
            }`}
          >
            <Music size={18} />
            <span>Tracks</span>
          </button>
          <button 
            onClick={() => setCurrentTab("artists")} 
            className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              currentTab === "artists" ? "bg-green-500 text-black" : "text-gray-300 hover:text-white"
            }`}
          >
            <User size={18} />
            <span>Artists</span>
          </button>
          <button 
            onClick={() => setCurrentTab("insights")} 
            className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              currentTab === "insights" ? "bg-green-500 text-black" : "text-gray-300 hover:text-white"
            }`}
          >
            <BarChart2 size={18} />
            <span>Insights</span>
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center space-x-3">
          {user?.images && user.images.length > 0 ? (
            <img
              src={user.images[0]?.url}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <User size={24} className="text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{user?.display_name || "Loading..."}</h2>
            {user?.product && (
              <span className="text-xs text-gray-400">{user.product === "premium" ? "Premium" : "Free"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-center mt-4 space-x-2">
        <button 
          onClick={() => setCurrentTab("tracks")} 
          className={`flex items-center p-2 rounded-full ${
            currentTab === "tracks" ? "bg-green-500 text-black" : "text-gray-300"
          }`}
        >
          <Music size={20} />
        </button>
        <button 
          onClick={() => setCurrentTab("artists")} 
          className={`flex items-center p-2 rounded-full ${
            currentTab === "artists" ? "bg-green-500 text-black" : "text-gray-300"
          }`}
        >
          <User size={20} />
        </button>
        <button 
          onClick={() => setCurrentTab("insights")} 
          className={`flex items-center p-2 rounded-full ${
            currentTab === "insights" ? "bg-green-500 text-black" : "text-gray-300"
          }`}
        >
          <BarChart2 size={20} />
        </button>
      </div>

      {/* Time period selector */}
      <div className="flex justify-center mt-4 space-x-4">
        <button 
          onClick={() => setPeriod("short_term")} 
          className={`px-4 py-2 rounded-full text-sm ${
            period === "short_term" ? "bg-green-500 text-black" : "bg-gray-800 text-gray-300"
          }`}
        >
          Last 4 weeks
        </button>
        <button 
          onClick={() => setPeriod("medium_term")} 
          className={`px-4 py-2 rounded-full text-sm ${
            period === "medium_term" ? "bg-green-500 text-black" : "bg-gray-800 text-gray-300"
          }`}
        >
          Last 6 months
        </button>
        <button 
          onClick={() => setPeriod("long_term")} 
          className={`px-4 py-2 rounded-full text-sm ${
            period === "long_term" ? "bg-green-500 text-black" : "bg-gray-800 text-gray-300"
          }`}
        >
          All time
        </button>

        {/* Limit selector */}
        <label className="flex items-center space-x-2">
            <span className="text-gray-400">Limit:</span>
            <input
                type="number"
                placeholder="Limit"
                min={1}
                max={50}
                defaultValue={50}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-20 px-2 py-1 bg-gray-800 rounded-md text-gray-300"
            />
        </label>

      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading your stats...</p>
        </div>
      ) : (
        <div className="container mx-auto mt-8 px-4 pb-20">
          {/* Tracks view */}
          {currentTab === "tracks" && (
            <div className="space-y-8">
              {/* Featured track */}
              {tracks.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70 rounded-lg"></div>
                  <img 
                    src={tracks[0].album.images[0]?.url} 
                    alt="Featured Track" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 p-6 text-left">
                    <h2 className="text-3xl font-bold">{tracks[0].name}</h2>
                    <p className="text-xl text-gray-300">{tracks[0].artists.map(a => a.name).join(", ")}</p>
                    <p className="text-sm text-gray-400">Your #1 track {normalizeTimePeriod(period).toLowerCase()}</p>
                    <div className="flex items-center space-x-4 mt-4">
                      <button 
                      onClick={() => tracks[0].is_playable && togglePlay(tracks[0])} 
                      className="bg-green-500 text-black p-3 rounded-full hover:bg-green-400 transition-colors"
                      disabled={!tracks[0].is_playable}
                    >
                    </button>
                    <button
                      onClick={() => openDetailsModal(tracks[0])}
                      className="bg-opacity-10 text-white p-3 rounded-full hover:bg-opacity-20 transition-colors"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Track list */}
            <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6">Your Top Tracks</h3>
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    className="group flex items-center p-3 hover:bg-slate-800 hover:bg-opacity-10 rounded-lg transition-colors cursor-pointer"
                    onClick={() => openDetailsModal(track)}
                  >
                    <div className="w-8 text-center text-gray-500 font-semibold">{index + 1}</div>
                    <div className="flex-shrink-0 ml-3 relative">
                      <img
                        src={track.album.images[0]?.url || "/placeholder.png"}
                        alt={track.name}
                        className="w-14 h-14 object-cover rounded-md"
                      />
                      {track.preview_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay(track);
                          }}
                          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                            isPlaying && currentTrack === track.id ? "opacity-100" : ""
                          }`}
                        >
                          {isPlaying && currentTrack === track.id ? (
                            <Pause size={24} className="text-white" />
                          ) : (
                            <Play size={24} className="text-white" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold truncate">{track.name}</h4>
                        <div className="flex items-center space-x-3 text-gray-400">
                          {track.explicit && (
                            <span className="px-1 text-xs font-bold border border-gray-500 rounded">E</span>
                          )}
                          <span className="text-sm">{formatDuration(track.duration_ms)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 truncate">{track.artists.map(a => a.name).join(", ")}</p>
                        <div className="flex items-center">
                          <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">
                            Popularity: {track.popularity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Artists view */}
        {currentTab === "artists" && (
          <div className="space-y-8">
            {/* Top artists grid */}
            <h3 className="text-2xl font-bold mb-6">Your Top Artists</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {artists.map((artist, index) => (
                <div 
                  key={artist.id}
                  className="bg-gray-900 rounded-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer"
                  onClick={() => openDetailsModal(artist)}
                >
                  <div className="relative pb-full">
                    <img 
                      src={artist.images[0]?.url || "/placeholder-artist.png"} 
                      alt={artist.name}
                      className="inset-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold truncate">{artist.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                      <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">
                        {artist.popularity}%
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {artist.genres?.slice(0, 2).map((genre, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-green-900 rounded-full text-green-200">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights view */}
        {currentTab === "insights" && insights && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold mb-6">Listening Insights</h3>
            
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Avg. Popularity</h4>
                  <Award size={24} className="text-yellow-500" />
                </div>
                <p className="text-3xl font-bold mt-2">{insights.avgPopularity}<span className="text-sm text-gray-400">/100</span></p>
                <p className="text-xs text-gray-400 mt-1">
                  Based on all tracks popularity scores
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Total Duration</h4>
                  <Clock size={24} className="text-blue-500" />
                </div>
                <p className="text-3xl font-bold mt-2">
                  {Math.floor(insights.totalDuration / (1000 * 60 * 60))}h {Math.floor((insights.totalDuration % (1000 * 60 * 60)) / (1000 * 60))}m
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Combined length of your top tracks
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Top Genre</h4>
                  <Music size={24} className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold mt-2 capitalize truncate">
                  {insights.topGenres[0]?.genre || "None"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {insights.topGenres[0]?.count || 0} artists in this genre
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Explicit Tracks</h4>
                  <TrendingUp size={24} className="text-red-500" />
                </div>
                <p className="text-3xl font-bold mt-2">
                  {insights.explicitTracks} <span className="text-sm text-gray-400">/{tracks.length}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((insights.explicitTracks / tracks.length) * 100)}% of your top tracks
                </p>
              </div>
            </div>
            
            {/* Genre breakdown */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-4">Genre Breakdown</h4>
              <div className="space-y-3">
                {insights.topGenres.map((genre: {genre: string, count: number}, index: number) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="capitalize">{genre.genre}</span>
                      <span className="text-xs text-gray-400">{genre.count} artists</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(genre.count / insights.topGenres[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Decade breakdown */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-4">Music by Decade</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {insights.decades.map(([decade, count]: [string, number], index: number) => (
                  <div key={index} className="text-center p-3 bg-gray-800 rounded-lg">
                    <h5 className="text-lg font-semibold">{decade}</h5>
                    <p className="text-3xl font-bold">{count}</p>
                    <p className="text-xs text-gray-400">tracks</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Audio player */}
    <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

    {/* Current Playing Bar */}
    {isPlaying && currentTrack && (
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-lg p-4 flex items-center justify-between">
        {tracks.filter(t => t.id === currentTrack).map(track => (
          <div key={track.id} className="flex items-center">
            <img 
              src={track.album.images[0]?.url} 
              alt={track.name} 
              className="w-12 h-12 object-cover rounded-md"
            />
            <div className="ml-3">
              <p className="font-semibold text-sm">{track.name}</p>
              <p className="text-xs text-gray-400">{track.artists.map(a => a.name).join(", ")}</p>
            </div>
          </div>
        ))}
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) {
                  audioRef.current.pause();
                } else {
                  audioRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }
            }}
            className="bg-green-500 text-black p-2 rounded-full hover:bg-green-400 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      </div>
    )}

    {/* Details Modal */}
    {showModal && modalContent && (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
          <div className="p-6">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <span className="text-2xl">×</span>
            </button>
            
            {'album' in modalContent ? (
              // Track Details
              <div>
                <div className="flex items-start space-x-4">
                  <img 
                    src={modalContent.album.images[0]?.url} 
                    alt={modalContent.name} 
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-2xl font-bold">{modalContent.name}</h3>
                    <p className="text-gray-400">
                      {modalContent.artists.map(a => a.name).join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Album: {modalContent.album.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Released: {modalContent.album.release_date}
                    </p>
                    
                    <div className="mt-4 flex items-center space-x-3">
                      <button 
                        onClick={() => modalContent.is_playable && togglePlay(modalContent)}
                        disabled={!modalContent.is_playable}
                        className={`px-4 py-2 rounded-full ${
                          modalContent.is_playable
                            ? "bg-green-50 text-black hover:bg-green-400" 
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {isPlaying && currentTrack === modalContent.id ? "Pause" : "Play Preview"}
                      </button>
                      <button className="px-4 py-2 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700">
                        Open in Spotify
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Popularity</h4>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-200 bg-green-900">
                              {modalContent.popularity}%
                            </span>
                          </div>
                        </div>
                        <div className="flex h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${modalContent.popularity}%` }}
                            className="bg-gradient-to-r from-green-500 to-green-300"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">Duration</h4>
                      <p className="text-2xl font-bold">
                        {formatDuration(modalContent.duration_ms)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Artists</h4>
                    <div className="space-y-2">
                      {modalContent.artists.map((artist, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{artist.name}</span>
                          <button className="text-xs text-green-400 hover:underline">
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Artist Details
                <div>
                  <div className="flex items-start space-x-4">
                    <img 
                      src={modalContent.images[0]?.url} 
                      alt={modalContent.name} 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{modalContent.name}</h3>
                      <p className="text-gray-400">
                        {modalContent.followers.total.toLocaleString()} followers
                      </p>
                      <p className="text-sm text-gray-500">
                        Popularity: {modalContent.popularity}%
                      </p>
                      
                      <div className="mt-4">
                        <button className="px-4 py-2 bg-green-500 text-black rounded-full hover:bg-green-400">
                          Open in Spotify
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Top Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {modalContent.genres.map((genre, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm capitalize"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Popularity</h4>
                    <div className="relative pt-1">
                      <div className="flex h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${modalContent.popularity}%` }}
                          className="bg-gradient-to-r from-green-500 to-green-300 flex items-center justify-center"
                        >
                          <span className="text-xs font-semibold text-gray-900">
                            {modalContent.popularity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}