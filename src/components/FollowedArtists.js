import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FollowedArtists = ({ accessToken }) => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me/following?type=artist', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        setArtists(response.data.artists.items);
      } catch (error) {
        console.error('Error fetching artists', error);
      }
    };
    fetchArtists();
  }, [accessToken]);

  const followArtist = async (artistId) => {
    try {
      await axios.put(`https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      alert('Artist followed');
    } catch (error) {
      console.error('Error following artist', error);
    }
  };

  const unfollowArtist = async (artistId) => {
    try {
      await axios.delete(`https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      alert('Artist unfollowed');
    } catch (error) {
      console.error('Error unfollowing artist', error);
    }
  };

  const exportArtists = () => {
    const csvContent = "data:text/csv;charset=utf-8," + artists.map(e => e.name).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "followed_artists.csv");
    document.body.appendChild(link); 
    link.click();
  };

  return (
    <div>
      <h1>Followed Artists</h1>
      <button onClick={exportArtists}>Export</button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>
            {artist.name}
            <button onClick={() => followArtist(artist.id)}>Follow</button>
            <button onClick={() => unfollowArtist(artist.id)}>Unfollow</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowedArtists;
