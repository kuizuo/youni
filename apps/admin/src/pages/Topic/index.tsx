import { addTopic, removeTopic, queryTopic, updateTopic } from '@/services/topic/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormSwitch,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useRef, useState } from 'react';

const handleAdd = async (fields: API.TopicItem) => {
  const hide = message.loading('正在添加');
  try {
    await addTopic({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败!');
    return false;
  }
};

const handleUpdate = async (fields: API.TopicItem) => {
  const hide = message.loading('Configuring');
  try {
    await updateTopic(fields.id!, {
      name: fields.name,
    });
    hide();

    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败');
    return false;
  }
};

const handleRemove = async (selectedRows: API.TopicItem[]) => {
  console.log("🚀 ~ handleRemove ~ selectedRows:", selectedRows)
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeTopic(selectedRows.map((row) => row.id));
    hide();
    message.success('已成功删除，将很快刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败');
    return false;
  }
};

const TableList: React.FC = () => {

  const [createModalOpen, handleModalOpen] = useState<boolean>(false);

  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.TopicItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.TopicItem[]>([]);

  const columns: ProColumns<API.TopicItem>[] = [
    {
      title: '话题',
      dataIndex: 'name',
      width: 160,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '图文数量',
      dataIndex: '_count.note',
      width: 160,
      sorter: true,
      hideInSearch: true,
      render: (dom, entity) => {
        return (<span>{entity._count.notes}</span>)
      },
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      width: 180
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>
      ],
    },
  ];

  return (
    <PageContainer header={{ title: '话题管理' }}>
      <ProTable<API.TopicItem, API.PageParams>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={queryTopic}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={'新建话题'}
        width="400px"
        layout="horizontal"
        grid
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.TopicItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: "话题的值不能为空",
            },
          ]}
          label={"话题"}
          colProps={{
            span: 24,
          }}
          name="name"
        />
        <ProFormText
          hidden
          label={"类型"}
          colProps={{
            span: 24,
          }}
          initialValue={"topic"}
          name="type"
        />
      </ModalForm>

      <ModalForm
        title={'更新话题'}
        width="400px"
        layout="horizontal"
        grid
        open={updateModalOpen}
        onOpenChange={handleUpdateModalOpen}
        initialValues={{
          value: currentRow?.title,
          status: currentRow?.state,
        }}
        onFinish={async (value) => {
          const success = await handleUpdate({ id: currentRow?.id, ...value });
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >

        <ProFormSwitch
          label={"状态"}
          colProps={{
            span: 6,
          }}
          name="status"
        />
      </ModalForm>

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.title && (
          <ProDescriptions<API.TopicItem>
            column={1}
            title={currentRow?.title}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.title,
            }}
            columns={columns as ProDescriptionsItemProps<API.TopicItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
