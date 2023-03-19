import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getPlaylistById, getAudioFeaturesForTracks } from '../spotify';
import { TrackList, SectionWrapper, Loader } from '../components';
import { StyledHeader } from '../styles';

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [tracksData, setTracksData] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getPlaylistById(id);
        setPlaylist(data);
        setTracksData(data.tracks);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!tracksData) {
      return;
    }

    const fetchMoreData = async () => {
      try {
        if (tracksData.next) {
          const { data } = await axios.get(tracksData.next);
          setTracksData(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    setTracks((tracks) => [...(tracks ? tracks : []), ...tracksData.items]);

    fetchMoreData();

    const fetchAudioFeatures = async () => {
      try {
        const ids = tracksData.items.map(({ track }) => track.id).join(',');
        const { data } = await getAudioFeaturesForTracks(ids);
        setAudioFeatures((audioFeatures) => [...(audioFeatures ? audioFeatures : []), ...data['audio_features']]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAudioFeatures();
  }, [tracksData]);

  const tracksWithAudioFeatures = useMemo(() => {
    if (!tracks || !audioFeatures) {
      return null;
    }

    return tracks.map(({ track }) => {
      const trackToAdd = track;

      if (!track.audio_features) {
        const audioFeaturesObj = audioFeatures.find((item) => {
          if (!item || !track) {
            return null;
          }
          return item.id === track.id;
        });

        trackToAdd['audio_features'] = audioFeaturesObj;
      }

      return trackToAdd;
    });
  }, [tracks, audioFeatures]);

  const sortedTracks = useMemo(() => {
    if (!tracksWithAudioFeatures) {
      return null;
    }

    return [...tracksWithAudioFeatures].sort((a, b) => {
      const aFeatures = a['audio_features'];
      const bFeatures = b['audio_features'];

      if (!aFeatures || !bFeatures) {
        return false;
      }

      return bFeatures - aFeatures;
    });
  }, [tracksWithAudioFeatures]);

  return (
    <>
      {playlist ? (
        <>
          <StyledHeader>
            <div className='header__inner'>
              {playlist.images.length && playlist.images[0].url && <img className='header__img' src={playlist.images[0].url} alt='Playlist Artwork' />}
              <div>
                <div className='header__overline'>Playlist</div>
                <h1 className='header__name'>{playlist.name}</h1>
                <p className='header__meta'>
                  {playlist.followers.total ? (
                    <span>
                      {playlist.followers.total} {`follower${playlist.followers.total !== 1 ? 's' : ''}`}
                    </span>
                  ) : null}
                  <span>
                    {playlist.tracks.total} {`song${playlist.tracks.total !== 1 ? 's' : ''}`}
                  </span>
                </p>
              </div>
            </div>
          </StyledHeader>

          <main>
            <SectionWrapper title='Playlist' breadcrumb={true}>
              {sortedTracks && <TrackList tracks={sortedTracks} />}
            </SectionWrapper>
          </main>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Playlist;
