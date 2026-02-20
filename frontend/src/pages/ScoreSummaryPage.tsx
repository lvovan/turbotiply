import React from 'react';
import ScoreSummary from '../components/GamePlay/ScoreSummary/ScoreSummary';

const ScoreSummaryPage: React.FC = () => {
  // Placeholder props for now
  return (
    <ScoreSummary
      score={0}
      onPlayAgain={() => {}}
      onBackToMenu={() => {}}
      rounds={[]}
      gameMode="play"
    />
  );
};

export default ScoreSummaryPage;
