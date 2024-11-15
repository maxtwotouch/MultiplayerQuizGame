import React, { useState, useEffect } from 'react';
import { subjects } from '../../data/subjects';
import { useLobby } from '../../contexts/LobbyContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

const SubjectSelector: React.FC = () => {
  const { lobby, updateSubject } = useLobby(); // Access updateSubject
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>(lobby?.subject || '');

  useEffect(() => {
    if (lobby?.subject) {
      setSelectedSubject(lobby.subject);
    }
  }, [lobby]);

  const handleSubjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubject = e.target.value;
    setSelectedSubject(newSubject);

    if (lobby && user) {
      try {
        // Update the lobby's subject using the exposed function
        await updateSubject(newSubject);
        toast.success(`Subject updated to ${subjects.find(s => s.id === newSubject)?.name || 'Selected Subject'}`);
      } catch (error) {
        console.error('Unexpected error updating subject:', error);
        toast.error('Failed to update subject. Please try again.');
      }
    }
  };

  return (
    <div className="mt-6">
      <label htmlFor="subject" className="block mb-2 font-medium">
        Select Subject:
      </label>
      <select
        id="subject"
        value={selectedSubject}
        onChange={handleSubjectChange}
        className="select select-bordered w-full max-w-xs"
        disabled={!lobby?.host || lobby.status !== 'waiting'}
      >
        <option value="">-- Select a Subject --</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
      <ToastContainer />
    </div>
  );
};

export default SubjectSelector;
