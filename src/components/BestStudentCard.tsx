import React from 'react';
import { Card, Button, Space } from 'antd';
import { TrophyOutlined, StarFilled, UserOutlined } from '@ant-design/icons';

const BestStudentCard = () => {
  return (
    <div style={{
      background: '#f0f2f5',
      minHeight: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        styles={{
          body: { padding: 0, position: 'relative' }
        }}
        style={{
          width: 500,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          background: 'rgba(255, 255, 255, 0.85)',
          overflow: 'hidden'
        }}
      >
        {/* Badge */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          background: '#ff4d4f',
          color: 'white',
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(35deg)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1
        }}>
          <StarFilled style={{ fontSize: 36 }} />
        </div>

        {/* Content */}
        <div style={{ padding: 24, position: 'relative', zIndex: 2 }}>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <div>
              <h3 style={{ color: 'black', margin: 0, fontSize: 20, fontWeight: 600 }}>
                Congratulations Sarah! 🎓
              </h3>
              <p style={{ color: 'rgba(27, 22, 22, 0.85)', fontSize: 16, margin: '4px 0 0 0' }}>
                Outstanding Academic Achievement
              </p>
            </div>

            <div>
              <h2 style={{ color: 'black', margin: 0, fontSize: 32, fontWeight: 700 }}>
                98.5%
              </h2>
              <p style={{ color: 'rgba(22, 20, 20, 0.85)', fontSize: 16, margin: '4px 0 0 0' }}>
                Top of your class! 🌟
              </p>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              style={{
                width: 'fit-content',
                background: '#ff4d4f',
                borderColor: '#ff4d4f',
                fontWeight: 600
              }}
            >
              View Profile
            </Button>
          </Space>
        </div>

        {/* Trophy Icon */}
        <TrophyOutlined
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            fontSize: 80,
            color: '#ffc53d',
            opacity: 0.9,
            filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))'
          }}
        />
      </Card>
    </div>
  );
};

export default BestStudentCard;