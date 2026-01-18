
// ============================================
// NanoNovel - App Component
// ============================================

import { useGameStore } from '@/core/stores/gameStore';
import { TitleScreen } from '@/screens/01_Title/TitleScreen';
import { ChapterScreen } from '@/screens/02_Novel/ChapterScreen';
import { NovelScreen } from '@/screens/02_Novel/NovelScreen';
import { BattleScreen } from '@/screens/03_Battle/BattleScreen';
import '@/styles/global.css';
import { CollectionScreen } from '@/screens/11_Collection/CollectionScreen';

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
        return <CollectionScreen />;
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
