// src/pages/Lobby.tsx
import React from 'react';
import { useLobby } from '../contexts/LobbyContext';
import CreateLobby from '../components/Lobby/CreateLobby';
import JoinLobby from '../components/Lobby/JoinLobby';
import PlayerList from '../components/Lobby/PlayerList';
import StartGameButton from '../components/Lobby/StartGameButton';
import LeaveLobbyButton from '../components/Lobby/LeaveLobbyButton';

const Lobby: React.FC = () => {
  const { lobby } = useLobby();

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Lobby</h2>
      {!lobby ? (
        <div style={styles.lobbyOptions}>
          <CreateLobby />
          <hr style={styles.divider} />
          <JoinLobby />
        </div>
      ) : (
        <div style={styles.lobbyDetails}>
          <p style={styles.lobbyCode}>
            Your Lobby Code: <strong>{lobby.code}</strong>
          </p>
          <PlayerList />
          <div style={styles.buttonsContainer}>
            {lobby.host && <StartGameButton />}
            <LeaveLobbyButton />
          </div>
        </div>
      )}
    </div>
  );
};

// Inline styles for better readability and maintenance
const styles = {
  container: {
    textAlign: 'center' as const,
    marginTop: '2rem',
    padding: '1rem',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  lobbyOptions: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  divider: {
    width: '80%',
    margin: '2rem 0',
  },
  lobbyDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  lobbyCode: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
};

export default Lobby;
