import React from 'react';
import { useLobby } from '../contexts/LobbyContext';
import CreateLobby from '../components/Lobby/CreateLobby';
import JoinLobby from '../components/Lobby/JoinLobby';
import PlayerList from '../components/Lobby/PlayerList';
import StartGameButton from '../components/Lobby/StartGameButton';
import LeaveLobbyButton from '../components/Lobby/LeaveLobbyButton';
import SubjectSelector from '../components/Lobby/SubjectSelector';

const Lobby: React.FC = () => {
  const { lobby } = useLobby();

  return (
    <div className="text-center mt-8 px-4 max-w-2xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Lobby</h2>
      {!lobby ? (
        <div className="flex flex-col items-center space-y-4">
          <CreateLobby />
          <div className="divider"></div> {/* DaisyUI Divider */}
          <JoinLobby />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-xl">
            Your Lobby Code: <strong className="text-custom-blue">{lobby.code}</strong>
          </p>

          {/* Display the Subject */}
          <p className="text-lg">
            Subject: {' '}
            {lobby.subject ? (
              <strong className="text-custom-blue">{lobby.subject}</strong>
            ) : (
              <span className="text-gray-500">No subject selected yet.</span>
            )}
          </p>

          {/* If the user is the host, show the SubjectSelector */}
          {lobby.host && <SubjectSelector />}

          {/* Inform players if subject is not yet selected */}
          {!lobby.subject && !lobby.host && (
            <p className="text-gray-500 mt-2">
              Waiting for the host to select a subject...
            </p>
          )}

          <PlayerList />

          <div className="flex space-x-4 mt-4">
            {lobby.host && <StartGameButton />}
            <LeaveLobbyButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;