/**
 * ============================================================================
 * Simple Chart Components - IRCA Platform
 * ============================================================================
 * Basic chart components for data visualization without external dependencies
 * ============================================================================
 */

import React from 'react';

interface ProgressChartProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ 
  value, 
  max, 
  label, 
  color = 'blue' 
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value} / {max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} h-3 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-muted-foreground text-right">
        {percentage.toFixed(1)}% complete
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral',
  color = 'blue' 
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  const bgColors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${bgColors[color as keyof typeof bgColors] || bgColors.blue} shadow-sm`}>
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
      {trend !== 'neutral' && (
        <div className={`text-xs mt-2 ${trendColors[trend]}`}>
          {trendIcons[trend]} 
          {trend === 'up' ? ' Improving' : trend === 'down' ? ' Declining' : ' Stable'}
        </div>
      )}
    </div>
  );
};

interface MilestoneChartProps {
  milestones: Array<{
    days: number;
    achieved: boolean;
    date?: string;
  }>;
}

export const MilestoneChart: React.FC<MilestoneChartProps> = ({ milestones }) => {
  return (
    <div className="space-y-2">
      {milestones.map((milestone, index) => (
        <div 
          key={index}
          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
            milestone.achieved 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
            milestone.achieved 
              ? 'bg-green-500 shadow-sm' 
              : 'bg-gray-300'
          }`}>
            {milestone.achieved && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {milestone.days} {milestone.days === 1 ? 'day' : 'days'}
              </div>
              {milestone.achieved && (
                <div className="text-xs text-green-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Achieved
                </div>
              )}
            </div>
            {milestone.date && milestone.achieved && (
              <div className="text-xs text-muted-foreground mt-1">
                Since {new Date(milestone.date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
