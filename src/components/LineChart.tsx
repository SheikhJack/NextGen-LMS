"use client"

import React from 'react';
import { Card, Statistic } from 'antd';
import { Line } from '@ant-design/charts';

const LineChart = () => {
  const data = [
    { week: 'Week 1', score: 72 },
    { week: 'Week 2', score: 78 },
    { week: 'Week 3', score: 75 },
    { week: 'Week 4', score: 82 },
    { week: 'Week 5', score: 85 },
    { week: 'Week 6', score: 88 }
  ];

  const config = {
    data,
    height: 100,
    autoFit: true,
    xField: 'week',
    yField: 'score',
    smooth: false,
    lineStyle: {
      stroke: '#1890ff',
      lineWidth: 3,
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#1890ff',
        stroke: '#fff',
        lineWidth: 2,
      },
    },
    xAxis: {
      label: null,
      line: null,
      tickLine: null,
    },
    yAxis: {
      label: null,
      grid: null,
      line: null,
      tickLine: null,
    },
    tooltip: false,
  };

  return (
    <Card 
      styles={{
        body: { padding: 16 }
      }}
      style={{ 
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        height: '100%'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header with statistic */}
        <div>
          <Statistic
            title="Student Performance"
            value={88.5}
            precision={1}
            valueStyle={{ color: '#3f8600' }}
            suffix="%"
          />
        </div>
        
        {/* Chart - only line visible */}
        <div style={{ height: 100, width: '100%' }}>
          <Line {...config} />
        </div>
        
        {/* Additional info */}
        <div style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          6-week progress trend
        </div>
      </div>
    </Card>
  );
};

export default LineChart;