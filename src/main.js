const state = {
  tmdbMovies: [],
  youtubeVideos: []
};

const appConfig = {
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  tmdbApiKey: 'YOUR_TMDB_API_KEY',
  youtubeApiKey: 'YOUR_YOUTUBE_API_KEY'
};

const isConfigured = Object.values(appConfig).every((value) => !value.includes('YOUR_'));

const movieList = document.querySelector('#movie-list');
const youtubeList = document.querySelector('#youtube-list');
const statusText = document.querySelector('#status-text');
const configBadge = document.querySelector('#config-badge');
const connectButton = document.querySelector('#connect-button');

function setStatus(message, type = 'neutral') {
  statusText.textContent = message;
  statusText.dataset.type = type;
}

function renderMovieCards() {
  if (!state.tmdbMovies.length) {
    movieList.innerHTML = '<div class="empty">No movies loaded yet.</div>';
    return;
  }

  movieList.innerHTML = state.tmdbMovies
    .slice(0, 6)
    .map((movie) => {
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : 'https://placehold.co/300x450/0d1b2a/eaf2ff?text=No+Image';

      return `
        <article class="media-card">
          <img src="${poster}" alt="${movie.title}" />
          <div class="media-body">
            <h4>${movie.title}</h4>
            <p>${movie.overview ? movie.overview.slice(0, 110) + '...' : 'No description available.'}</p>
            <div class="meta-row">
              <span>⭐ ${movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
              <span>${movie.release_date?.slice(0, 4) ?? 'N/A'}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderYoutubeCards() {
  if (!state.youtubeVideos.length) {
    youtubeList.innerHTML = '<div class="empty">No YouTube results yet.</div>';
    return;
  }

  youtubeList.innerHTML = state.youtubeVideos
    .slice(0, 4)
    .map((video) => {
      const thumb = video.snippet.thumbnails?.medium?.url || 'https://placehold.co/320x180/0d1b2a/eaf2ff?text=Video';
      return `
        <article class="video-card">
          <img src="${thumb}" alt="${video.snippet.title}" />
          <div class="video-body">
            <h4>${video.snippet.title}</h4>
            <p>${video.snippet.channelTitle}</p>
            <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank" rel="noreferrer">Watch</a>
          </div>
        </article>
      `;
    })
    .join('');
}

async function loadTmdbMovies() {
  if (!isConfigured) {
    setStatus('Add your real API keys in src/config.js to fetch live TMDB and YouTube data.', 'warning');
    return;
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${appConfig.tmdbApiKey}&language=en-US&page=1`);
    const data = await response.json();
    state.tmdbMovies = data.results || [];
    renderMovieCards();
    setStatus('TMDB data loaded successfully.', 'success');
  } catch (error) {
    setStatus('TMDB request failed. Check your key and network access.', 'error');
    console.error(error);
  }
}

async function loadYoutubeVideos() {
  if (!isConfigured) {
    setStatus('Add your real API keys in src/config.js to fetch live TMDB and YouTube data.', 'warning');
    return;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&q=technology+news&type=video&key=${appConfig.youtubeApiKey}`);
    const data = await response.json();
    state.youtubeVideos = data.items || [];
    renderYoutubeCards();
    setStatus('YouTube search loaded successfully.', 'success');
  } catch (error) {
    setStatus('YouTube request failed. Check your key and API permissions.', 'error');
    console.error(error);
  }
}

async function testSupabaseConnection() {
  if (!isConfigured) {
    setStatus('Supabase connection is not active until real keys are inserted in src/config.js.', 'warning');
    return;
  }

  try {
    const response = await fetch(`${appConfig.supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: appConfig.supabaseAnonKey,
        Authorization: `Bearer ${appConfig.supabaseAnonKey}`
      }
    });

    if (response.ok) {
      setStatus('Supabase connection is working.', 'success');
    } else {
      setStatus('Supabase responded, but the request was rejected. Check the project URL and anon key.', 'error');
    }
  } catch (error) {
    setStatus('Supabase connection failed. Verify your project URL and keys.', 'error');
    console.error(error);
  }
}

function updateConfigBadge() {
  configBadge.textContent = isConfigured ? 'Connected' : 'Need API keys';
  configBadge.classList.toggle('active', isConfigured);
}

connectButton.addEventListener('click', async () => {
  updateConfigBadge();
  await Promise.all([loadTmdbMovies(), loadYoutubeVideos(), testSupabaseConnection()]);
});

window.addEventListener('DOMContentLoaded', () => {
  renderMovieCards();
  renderYoutubeCards();
  updateConfigBadge();
  setStatus('App ready. Add your real keys to start live API calls.', 'neutral');
});
