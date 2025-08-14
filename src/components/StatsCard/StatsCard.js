import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi';
import './StatsCard.css';

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend = null,
  trendDirection = 'up',
  highlight = false,
  action = null,
  loading = false 
}) {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trendDirection === 'up' ? <FiTrendingUp /> : <FiTrendingDown />;
  };

  const getColorClasses = () => {
    const colorMap = {
      blue: 'stats-blue',
      green: 'stats-green',
      yellow: 'stats-yellow',
      red: 'stats-red',
      purple: 'stats-purple'
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className={`stats-card loading ${getColorClasses()}`}>
        <div className="stats-content">
          <div className="stats-header">
            <div className="stats-icon">
              <div className="spinner" />
            </div>
            <div className="stats-info">
              <div className="stats-title-skeleton" />
              <div className="stats-value-skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`stats-card ${getColorClasses()} ${highlight ? 'highlight' : ''} ${action ? 'clickable' : ''}`}>
      <div className="stats-content" onClick={action}>
        <div className="stats-header">
          <div className="stats-icon">
            <Icon />
          </div>
          
          <div className="stats-info">
            <h3 className="stats-title">{title}</h3>
            <div className="stats-value">{value}</div>
          </div>
          
          {action && (
            <div className="stats-action-icon">
              <FiArrowRight />
            </div>
          )}
        </div>
        
        {trend && (
          <div className="stats-footer">
            <div className={`stats-trend trend-${trendDirection}`}>
              {getTrendIcon()}
              <span className="trend-text">{trend}</span>
            </div>
          </div>
        )}
        
        {highlight && (
          <div className="stats-highlight-indicator">
            <div className="highlight-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
