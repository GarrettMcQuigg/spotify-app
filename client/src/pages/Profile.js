import { useState, useEffect } from 'react';
import { getCurrentUserProfile, getCurrentUserPlaylists, getTopArtists, getTopTracks } from '../spotify';
import { StyledHeader } from '../styles';
import { SectionWrapper, ArtistsGrid, TrackList, PlaylistsGrid, Loader } from '../components';
import styled from 'styled-components/macro';

const StyledSupportButton = styled.a`
  color: grey;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-pill);
  padding: 5px 10px;
  cursor: pointer;
  text-decoration: none;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [artists, setTopArtists] = useState(null);
  const [topTracks, setTopTracks] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile.data);

        const userPlaylists = await getCurrentUserPlaylists();
        setPlaylists(userPlaylists.data);

        const topArtists = await getTopArtists();
        setTopArtists(topArtists.data);

        const topTracks = await getTopTracks();
        setTopTracks(topTracks.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {profile && (
        <StyledHeader type='user'>
          <div className='header__inner'>
            {profile.images.length && profile.images[0].url && <img className='header__img' src={profile.images[0].url} alt='Avatar' />}
            <div>
              <div className='header__overline'>
                Profile{' '}
                <a href='/support'>
                  <StyledSupportButton>Support</StyledSupportButton>
                </a>
              </div>
              <h1 className='header__name'>{profile.display_name}</h1>
              <p className='header__meta'>
                {playlists && (
                  <span>
                    {playlists.total} Playlist{playlists.total !== 1 ? 's' : ''}
                  </span>
                )}
                <span>
                  {profile.followers.total} Follower{profile.followers.total !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
          </div>
        </StyledHeader>
      )}
      {artists && topTracks && playlists ? (
        <main>
          <SectionWrapper title='Top artists this month' seeAllLink='/top-artists'>
            <ArtistsGrid artists={artists.items.slice(0, 10)} />
          </SectionWrapper>

          <SectionWrapper title='Top tracks this month' seeAllLink='/top-tracks'>
            <TrackList tracks={topTracks.items.slice(0, 10)} />
          </SectionWrapper>

          <SectionWrapper title='Playlists' seeAllLink='/playlists'>
            <PlaylistsGrid playlists={playlists.items.slice(0, 10)} />
          </SectionWrapper>
        </main>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Profile;
