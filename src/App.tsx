// ============================================
// NanoNovel - App Component
// ============================================

import { useGameStore } from '@/core/stores/gameStore';
import { TitleScreen, ChapterScreen, NovelScreen } from '@/parts/novel';
import { BattleScreen } from '@/parts/battle';
import '@/styles/global.css';

function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);

  // Screen router based on Zustand state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'TITLE':
        return <TitleScreen />;
      case 'CHAPTER':
        return <ChapterScreen />;
      case 'NOVEL':
        return <NovelScreen />;
      case 'BATTLE':
        return <BattleScreen />;
      case 'RESULT':
        return <div className="screen-center"><h2>Result Screen</h2><p>（実装予定）</p></div>;
      case 'GALLERY':
        return <div className="screen-center"><h2>Gallery Screen</h2><p>（実装予定）</p></div>;
      case 'COLLECTION':
        return <div className="screen-center"><h2>Collection Screen</h2><p>（実装予定）</p></div>;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
    </>
  );
}

export default App;
