import { useState, useEffect } from 'react';
import { Music, Headphones, Clock, BarChart2, Calendar, User, ArrowRight, SignalMedium } from 'lucide-react';


export default function Landing({ handleLogin, isLoading }: { handleLogin: () => void, isLoading: boolean }) {
  const [showFeatures, setShowFeatures] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500 opacity-15 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 py-6 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
            SpotiStats

            <SignalMedium 
              size={32}
              className='mb-8 animate-pulse text-green-400'
            />
          </h1>

        </div>
      </header>

      <div className="container mx-auto px-6 md:px-12 relative z-10 pt-6 md:pt-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 mb-16 md:mb-32">
          <div className="md:w-1/2 max-w-2xl">
            <div className="mb-4 inline-block bg-gradient-to-r from-green-400/20 to-green-400/10 rounded-full px-4 py-1 text-sm font-medium text-green-400">
              Your Music, Visualized
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Unlock Your <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Spotify</span> Insights
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Discover your true musical identity with beautiful visualizations and detailed analytics of your personal listening habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className={`group flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 ${isLoading ? 'opacity-75' : ''}`}
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Connecting...'
                ) : (
                  <>
                    <Headphones size={20} />
                    Connect Spotify
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      <ArrowRight size={20} />
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
            {/* Stylized mockup of what users will see after signing in */}
            <div className="w-full mx-auto max-w-md relative z-10 transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10 duration-300">
              <div className="backdrop-blur-md bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                        
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Your Sound Profile</p>
                        <h3 className="font-bold text-xl">Preview</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                        Sign in to see
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Top Artist</span>
                        <span className="font-bold bg-white/20 animate-pulse rounded px-10">&nbsp;</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 transition-all hover:bg-white/10">
                        <Clock size={20} className="text-green-400 mb-3" />
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Listening Time</p>
                          <p className="font-bold text-2xl bg-white/20 animate-pulse rounded w-16">&nbsp;</p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 transition-all hover:bg-white/10">
                        <BarChart2 size={20} className="text-blue-400 mb-3" />
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Genres</p>
                          <p className="font-bold text-2xl bg-white/20 animate-pulse rounded w-16">&nbsp;</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 transition-all hover:bg-white/10">
                        <Calendar size={20} className="text-purple-400 mb-3" />
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Pattern Analysis</p>
                          <div className="font-bold text-2xl bg-white/20 animate-pulse rounded w-16">&nbsp;</div>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 transition-all hover:bg-white/10">
                        <User size={20} className="text-yellow-400 mb-3" />
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Music Persona</p>
                          <p className="font-bold bg-white/20 animate-pulse rounded w-24">&nbsp;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-24 md:mb-32 relative z-10">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-500 opacity-10 rounded-full blur-3xl"></div>
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-400/20 to-blue-400/10 rounded-full px-4 py-1 text-sm font-medium text-blue-400 mb-3">
              What You'll Discover
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-5">Connect to reveal insights</h2>
            <p className="text-gray-400 text-lg">Connect your Spotify account to unlock these personalized features</p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 transition-opacity duration-1000 ${showFeatures ? 'opacity-100' : 'opacity-0'}`}>
            {[
              {
                title: "Personalized Insights",
                description: "See detailed breakdowns of your most played artists, tracks, and genres over time.",
                icon: <BarChart2 size={32} className="text-green-400" />,
                color: "from-green-400 to-blue-500"
              },
              {
                title: "Listening Patterns",
                description: "Discover when and how you listen to music with beautiful time-based visualizations.",
                icon: <Clock size={32} className="text-blue-400" />,
                color: "from-blue-400 to-purple-500"
              },
              {
                title: "Music Explorer",
                description: "Understand your unique taste profile and see how your preferences evolve over time.",
                icon: <Music size={32} className="text-purple-400" />,
                color: "from-purple-400 to-pink-500"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 transition-all hover:shadow-lg hover:bg-white/10"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mb-24 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to analyze your music?</h2>
          <button 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
            onClick={handleLogin}
          >
            <Headphones size={20} />
            Connect with Spotify
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 mt-16 relative z-10">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} SpotiStats Not affiliated with Spotify.</p>
          <p className="text-xs mt-2">Connect your account to analyze your own personal Spotify data.</p>
          <p className="text-xs mt-2 opacity-50 mb-4">
            Created by <a href="https://kijmoshi.xyz" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">kijmoshi</a>
          </p>
        </div>
      </footer>
    </div>
  );
}