'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const FaHome = dynamic(
  () => import('react-icons/fa').then(mod => ({default: mod.FaHome})),
  {ssr: false},
);
const FaCalendarAlt = dynamic(
  () => import('react-icons/fa').then(mod => ({default: mod.FaCalendarAlt})),
  {ssr: false},
);
const FaCog = dynamic(
  () => import('react-icons/fa').then(mod => ({default: mod.FaCog})),
  {ssr: false},
);
const FaCat = dynamic(
  () => import('react-icons/fa').then(mod => ({default: mod.FaCat})),
  {ssr: false},
);

interface TabNavigationProps {
  activeTab: 'home' | 'calendar' | 'buddy' | 'settings';
  onTabChange: (tab: 'home' | 'calendar' | 'buddy' | 'settings') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: 'home' as const,
      label: '홈',
      icon: FaHome,
    },
    {
      id: 'calendar' as const,
      label: '캘린더',
      icon: FaCalendarAlt,
    },
    {
      id: 'buddy' as const,
      label: '버디',
      icon: FaCat,
    },
    {
      id: 'settings' as const,
      label: '설정',
      icon: FaCog,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              <IconComponent
                className={`text-xl mb-1 ${
                  isActive ? 'text-green-500' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-green-500' : 'text-gray-500'
                }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
