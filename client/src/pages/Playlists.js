import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUserPlaylists } from '../spotify';
import { SectionWrapper, PlaylistsGrid, Loader } from '../components';

const Playlists = () => {
  const [playlistsData, setPlaylistsData] = useState(null);
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getCurrentUserPlaylists();
        setPlaylistsData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!playlistsData) {
      return;
    }

    const fetchMoreData = async () => {
      try {
        if (playlistsData.next) {
          const { data } = await axios.get(playlistsData.next);
          setPlaylistsData(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    setPlaylists((playlists) => [...(playlists ? playlists : []), ...playlistsData.items]);

    fetchMoreData();
  }, [playlistsData]);

  return (
    <main>
      <SectionWrapper title='Public Playlists' breadcrumb={true}>
        {playlists ? <PlaylistsGrid playlists={playlists} /> : <Loader />}
      </SectionWrapper>
    </main>
  );
};

export default Playlists;
