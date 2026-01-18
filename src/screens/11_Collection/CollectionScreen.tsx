import { useState, useEffect } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { useViewMode } from '@/core/hooks/useViewMode';
import { ViewSwitcher } from '@/components/data-views/ViewSwitcher';
import { TableView, type TableColumn } from '@/components/data-views/TableView';
import { GalleryView } from '@/components/data-views/GalleryView';
import { KanbanView } from '@/components/data-views/KanbanView';
import { CharacterDetailView } from '@/parts/collection/specific/CharacterDetailView';
import { NPCDetailView } from '@/parts/collection/specific/NPCDetailView';
import { EnemyDetailView } from '@/parts/collection/specific/EnemyDetailView';
import { BackgroundDetailView } from '@/parts/collection/specific/BackgroundDetailView';
import { BGMPlayerView } from '@/parts/collection/specific/BGMPlayerView';
import { StudioScreen } from '@/screens/12_Studio/StudioScreen'; // [NEW] Import Studio
import characterData from '@/data/collection/characters.json';
import enemyData from '@/data/collection/enemies.json';
import npcData from '@/data/collection/npcs.json';
import backgroundData from '@/data/collection/backgrounds.json';
import itemData from '@/data/collection/items.json';
import './CollectionScreen.css';

// Column Definitions
const CHARACTER_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    { key: 'description', label: '説明' },
    {
        key: 'defaultTags',
        label: 'タグ',
        render: (tags: string[]) => (
            <div className="flex gap-1 flex-wrap">
                {(tags || []).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 border border-gray-600">
                        {tag}
                    </span>
                ))}
            </div>
        )
    }
];

const ENEMY_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    { key: 'description', label: '説明' },
    {
        key: 'stats',
        label: 'ステータス',
        render: (stats: any, _item: any) => {
            if (!stats) return <span className="text-xs text-gray-500">-</span>;
            return (
                <span className="text-xs text-gray-400">
                    HP:{stats?.hp ?? 0} / MP:{stats?.mp ?? 0}
                </span>
            );
        }
    }
];

const NPC_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    { key: 'role', label: '役割' },
    { key: 'location', label: '場所' },
    { key: 'dict', label: '説明' }
];

const PLACE_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '地名' },
    { key: 'region', label: '地域' },
    { key: 'description', label: '説明' }
];

const ITEM_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
    { key: 'category', label: 'カテゴリ' },
    { key: 'price', label: '価格' },
    { key: 'description', label: '説明' }
];

// Tab Types
type PrimaryTab = 'item' | 'equipment' | 'skill' | 'ability' | 'story' | 'library' | 'sound' | 'keymap' | 'studio';
type SecondaryTab = 'place' | 'character' | 'npc' | 'enemy' | 'item_dict' | 'event' | 'cg';

export function CollectionScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('library');
    const [secondaryTab, setSecondaryTab] = useState<SecondaryTab>('character');
    const { viewMode, setViewMode } = useViewMode('list');

    // Auto-switch to 'custom' view for Character tab
    useEffect(() => {
        if (secondaryTab === 'character') {
            setViewMode('custom');
        } else {
            if (viewMode === 'custom') setViewMode('list');
        }
    }, [secondaryTab]);

    // Data selector
    const getData = () => {
        if (primaryTab === 'library') {
            switch (secondaryTab) {
                case 'character': return characterData.characters || []; // Handle array wrapper
                case 'enemy': return enemyData.enemies || [];
                case 'npc': return npcData.npcs || [];
                case 'place': return backgroundData.locations || [];
                case 'item_dict': return itemData.items || [];
                default: return [];
            }
        }
        return [];
    };

    const getColumns = () => {
        switch (secondaryTab) {
            case 'character': return CHARACTER_COLUMNS;
            case 'enemy': return ENEMY_COLUMNS;
            case 'npc': return NPC_COLUMNS;
            case 'place': return PLACE_COLUMNS;
            case 'item_dict': return ITEM_COLUMNS;
            default: return [];
        }
    };

    const currentData = getData();
    const currentColumns = getColumns();

    const primaryTabs: { id: PrimaryTab; label: string }[] = [
        { id: 'item', label: 'アイテム' },
        { id: 'equipment', label: '装備' },
        { id: 'skill', label: 'スキル' },
        { id: 'ability', label: '能力' },
        { id: 'story', label: 'ストーリー' },
        { id: 'library', label: 'ライブラリー' },
        { id: 'sound', label: '音' },
        { id: 'keymap', label: 'キーマップ' },
        { id: 'studio', label: '工房' }, // [NEW] Studio Tab
    ];

    const secondaryTabs: { id: SecondaryTab; label: string }[] = [
        { id: 'place', label: '地名辞典' },
        { id: 'character', label: 'キャラクター図鑑' },
        { id: 'npc', label: 'NPC図鑑' },
        { id: 'enemy', label: 'エネミー図鑑' },
        { id: 'item_dict', label: 'アイテム図鑑' },
        { id: 'event', label: 'イベントDB' },
        { id: 'cg', label: 'CG・ギャラリー' }
    ];

    return (
        <div className="collection-screen">
            {/* Navigation Header */}
            <nav>
                {/* Primary Navigation */}
                <div className="collection-nav-primary">
                    {primaryTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setPrimaryTab(tab.id)}
                            className={`nav-item-primary ${primaryTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div className="back-button-container" style={{ marginLeft: 'auto' }}>
                        <button onClick={() => setScreen('TITLE')} className="back-button">
                            Titleへ戻る
                        </button>
                    </div>
                </div>

                {/* Secondary Navigation */}
                {primaryTab === 'library' && (
                    <div className="collection-nav-secondary">
                        {secondaryTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSecondaryTab(tab.id)}
                                className={`nav-item-secondary ${secondaryTab === tab.id ? 'active' : 'inactive'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="collection-content">
                {/* Render Studio Screen directly if selected */}
                {primaryTab === 'studio' ? (
                    <StudioScreen />
                ) : (
                    <>
                        {/* Normal Collection Content */}
                        <div className="collection-header">
                            <h2 className="collection-title">
                                {primaryTab === 'library'
                                    ? secondaryTabs.find(t => t.id === secondaryTab)?.label
                                    : primaryTabs.find(t => t.id === primaryTab)?.label}
                            </h2>
                            {primaryTab === 'library' && (
                                <ViewSwitcher currentView={viewMode} onViewChange={setViewMode as any} />
                            )}
                        </div>

                        {/* Content switching logic */}
                        {primaryTab === 'library' ? (
                            <div className="collection-view-container">
                                {viewMode === 'list' && <TableView data={currentData} columns={currentColumns} />}
                                {viewMode === 'gallery' && <GalleryView data={currentData} />}
                                {viewMode === 'kanban' && <KanbanView data={currentData} />}
                                {viewMode === 'custom' && (
                                    // Custom "Detail" View Switcher logic
                                    (() => {
                                        switch (secondaryTab) {
                                            case 'character':
                                                return <CharacterDetailView data={currentData as any[]} />;
                                            case 'npc':
                                                return <NPCDetailView data={currentData as any[]} />;
                                            case 'enemy':
                                                return <EnemyDetailView data={currentData as any[]} />;
                                            case 'place':
                                                return <BackgroundDetailView data={currentData as any[]} />;
                                            case 'item_dict':
                                                return <TableView data={currentData as any[]} columns={ITEM_COLUMNS} />;
                                            default:
                                                return <div className="p-4 text-gray-500">このカテゴリの詳細表示は未実装です</div>;
                                        }
                                    })()
                                )}
                            </div>
                        ) : (
                            <div>
                                <p>このセクションはまだ実装されていません。</p>
                            </div>
                        )}
                    </>
                )}

                {/* Render Sound/BGM Screen */}
                {primaryTab === 'sound' && (
                    <BGMPlayerView />
                )}
            </main>
        </div>
    );
}
