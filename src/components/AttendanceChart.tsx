"use client"; import { useState } from 'react';
import { Badge, Card, Col, List, Radio, Row } from 'antd';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DataItem {
  name: string;
  value: number;
}

interface DataType {
  all: DataItem[];
  online: DataItem[];
  offline: DataItem[];
}

const data: DataType = {
  all: [
    { name: 'Attendance', value: 4544 },
    { name: 'Boys', value: 3321 },
    { name: 'Girls', value: 3113 },
    { name: 'Teachers', value: 2341 },
    { name: 'Parents', value: 1231 },
    { name: 'Other', value: 132 },
  ],
  online: [
    { name: 'Attendance', value: 244 },
    { name: 'Boys', value: 231 },
    { name: 'Girls', value: 311 },
    { name: 'Teachers', value: 41 },
    { name: 'Parents', value: 121 },
    { name: 'Other', value: 111 },
  ],
  offline: [
    { name: 'Attendance', value: 99 },
    { name: 'Services', value: 188 },
    { name: 'Teachers', value: 344 },
    { name: 'Parents', value: 255 },
    { name: 'Other', value: 65 },
  ],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#E36E7E', '#8F66DE'];

const wrapperCol = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 12,
};

const DistributionCard = ({ loading = false }: { loading?: boolean }) => {
  const [dataType, setDataType] = useState<'all' | 'online' | 'offline'>('all');

  return (
    <Card
      title="Attendance Distribution"
      loading={loading}
      extra={
        <Radio.Group
          value={dataType}
          onChange={e => setDataType(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="online">Online</Radio.Button>
          <Radio.Button value="offline">Offline</Radio.Button>
        </Radio.Group>
      }
    >
      <Row gutter={20}>
        <Col {...wrapperCol}>
          <ResponsiveContainer height={250}>
            <PieChart>
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active) {
                    const { name, value } = payload[0];
                    const total = data[dataType].reduce((sum, item) => sum + item.value, 0);
                    const percent = ((value / total) * 100).toFixed(2) + '%';
                    return (
                      <div className="p-2 bg-white border rounded shadow">
                        {name}: {percent} ({value})
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                strokeOpacity={0}
                data={data[dataType]}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data[dataType].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col {...wrapperCol}>
          <List
            bordered
            dataSource={data[dataType]}
            renderItem={(item, index) => {
              const total = data[dataType].reduce((sum, i) => sum + i.value, 0);
              const percent = ((item.value / total) * 100).toFixed(2) + '%';

              return (
                <List.Item className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge color={COLORS[index]} />
                    <span>{item.name}</span>
                  </div>
                  <div className="font-medium">
                    {percent} ({item.value})
                  </div>
                </List.Item>
              );
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default DistributionCard;