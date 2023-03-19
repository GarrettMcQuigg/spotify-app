import { useState, useEffect } from 'react';
import { getTopArtists } from '../spotify';
import { ArtistsGrid, SectionWrapper, TimeRangeButtons, Loader } from '../components';

const TopArtists = () => {
  const [topArtists, setTopArtists] = useState(null);
  const [activeRange, setActiveRange] = useState('short');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getTopArtists(`${activeRange}_term`);
        setTopArtists(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [activeRange]);

  return (
    <main>
      {topArtists ? (
        <SectionWrapper title='Top Artists' breadcrumb={true}>
          <TimeRangeButtons activeRange={activeRange} setActiveRange={setActiveRange} />
          <ArtistsGrid artists={topArtists.items} />
        </SectionWrapper>
      ) : (
        <Loader />
      )}
    </main>
  );
};

export default TopArtists;
