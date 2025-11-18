import { useState, useCallback } from 'react';
import type { DesignChallenge, ChallengeStatus } from '../types/portfolio';

export const useChallenges = (initialChallenges: DesignChallenge[] = []) => {
  const [challenges, setChallenges] = useState<DesignChallenge[]>(initialChallenges);

  const updateChallengeStatus = useCallback((id: string, status: ChallengeStatus) => {
    setChallenges(prevChallenges =>
      prevChallenges.map(challenge =>
        challenge.id === id ? { ...challenge, status } : challenge
      )
    );
  }, []);

  return {
    challenges,
    updateChallengeStatus,
  };
};
