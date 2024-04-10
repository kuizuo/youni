import {
  DingdingOutlined,
  DownOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { GridContent, PageContainer, RouteContext } from '@ant-design/pro-components';
import { useParams, useRequest } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  Popover,
  Space,
  Statistic,
  Steps,
  Table,
  Tooltip,
} from 'antd';
import type { FC } from 'react';
import React, { Fragment, useState } from 'react';
import NoteTable from './components/note'


const action = (
  <RouteContext.Consumer>
    {({ isMobile }) => {
      if (isMobile) {
        return (
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            placement="bottomRight"
          >
            主操作
          </Dropdown.Button>
        );
      }
      return (
        <Space>

          <Button type="primary">主操作</Button>
        </Space>
      );
    }}
  </RouteContext.Consumer>
);

type AdvancedState = {
  operationKey: 'note' | 'notice' | 'nav';
  tabActiveKey: string;
};
const Detail: FC = () => {
  const { id: campusId } = useParams<{ id: string }>();

  const description = (
    <RouteContext.Consumer>
      {({ isMobile }) => (
        <Descriptions size="small" column={isMobile ? 1 : 2}>
          <Descriptions.Item label="管理人员"><a>厦门工学院官方账号</a></Descriptions.Item>
          <Descriptions.Item label="描述"> </Descriptions.Item>
        </Descriptions>
      )}
    </RouteContext.Consumer>
  );


  const [tabStatus, seTabStatus] = useState<AdvancedState>({
    operationKey: 'note',
    tabActiveKey: 'note',
  });

  const contentList = {
    note: (
      <NoteTable campusId={campusId} />
    ),
    // notice: (
    //   <NoticeTable campusId={campusId} />
    // ),
    // nav: (
    //   <NavTable campusId={campusId} />
    // ),
  };

  const onTabChange = (tabActiveKey: string) => {
    seTabStatus({
      ...tabStatus,
      tabActiveKey,
    });
  };

  return (
    <PageContainer
      title="厦门工学院"
      extra={action}
      content={description}
      tabActiveKey={tabStatus.tabActiveKey}
      onTabChange={onTabChange}
      tabList={[
        {
          key: 'note',
          tab: '图文',
        },
        {
          key: 'notice',
          tab: '公告',
        },
        {
          key: 'nav',
          tab: '导航',
        },
      ]}
    >
      {
        contentList[tabStatus.tabActiveKey]
      }
    </PageContainer>
  );
};
export default Detail;
