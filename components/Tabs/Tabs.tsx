import styles from './Tabs.module.css';

export type TabOption = {
  label: string;
  value: string;
  count?: number; 
};

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (value: any) => void;
}

export default function Tabs({ options, activeTab, onChange }: TabsProps) {
  return (
    <div className={styles.container}>
      {options.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`${styles.tabBtn} ${activeTab === tab.value ? styles.active : ''}`}
        >
          {/* Label comes first (Right side) */}
          {tab.label}
          
          {/* The count badge (Left side) */}
          {tab.count !== undefined && (
            <span className={styles.count}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}