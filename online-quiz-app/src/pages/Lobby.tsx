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
          <PlayerList />
          {lobby.host && <SubjectSelector />}
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
