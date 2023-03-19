import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import { accessToken, logout, getCurrentUserProfile } from './spotify';
import styled from 'styled-components/macro';
import { GlobalStyling } from './styles';
import { Login, Profile, TopArtists, TopTracks, Playlists, Playlist, Support } from './pages';

const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--white);
  font-size: var(--fz-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

function ScrollToTop() {
  const { path } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return null;
}

function App() {
  const [token, setToken] = useState(null);
  // eslint-disable-next-line
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setToken(accessToken);

    const fetchData = async () => {
      try {
        const { data } = await getCurrentUserProfile();
        setProfile(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='App'>
      <GlobalStyling />
      <header className='App-header'>
        {!token ? (
          <Login />
        ) : (
          <>
            <StyledLogoutButton onClick={logout}>Logout</StyledLogoutButton>
            <Router>
              <ScrollToTop />
              <Switch>
                <Route path='/top-artists'>
                  <TopArtists />
                </Route>
                <Route path='/top-tracks'>
                  <TopTracks />
                </Route>
                <Route path='/playlists/:id'>
                  <Playlist />
                </Route>
                <Route path='/playlists'>
                  <Playlists />
                </Route>
                <Route path='/support'>
                  <Support />
                </Route>
                <Route path='/'>
                  <Profile />
                </Route>
              </Switch>
            </Router>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
