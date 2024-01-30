import { addTodo, removeTodo, queryTodo, updateTodo } from '@/services/todo/api';
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
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message } from 'antd';
import React, { useRef, useState } from 'react';

const handleAdd = async (fields: API.TodoItem) => {
  const hide = message.loading('正在添加');
  try {
    await addTodo({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

const handleUpdate = async (fields: API.TodoItem) => {
  const hide = message.loading('Configuring');
  try {
    await updateTodo(fields.id!, {
      value: fields.value,
      status: fields.status,
    });
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

const handleRemove = async (selectedRows: API.TodoItem[]) => {
  console.log("🚀 ~ handleRemove ~ selectedRows:", selectedRows)
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeTodo(selectedRows.map((row) => row.id));
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.TodoItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.TodoItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.TodoItem>[] = [
    {
      title: '事项',
      dataIndex: 'value',
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
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        false: {
          text: '进行中',
          status: 'Processing',
        },
        true: {
          text: '已完成',
          status: 'Processing',
        },
      },
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          修改
        </a>
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.TodoItem, API.PageParams>
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
        request={queryTodo}
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
        title={'新建待办事项'}
        width="400px"
        layout="horizontal"
        grid
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.TodoItem);
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
              message: "待办事项的值不能为空",
            },
          ]}
          label={"事项"}
          colProps={{
            span: 18,
          }}
          name="value"
        />
        <ProFormSwitch
          label={"状态"}
          colProps={{
            span: 6,
          }}
          name="status"
        />
      </ModalForm>

      <ModalForm
        title={'更新待办事项'}
        width="400px"
        layout="horizontal"
        grid
        open={updateModalOpen}
        onOpenChange={handleUpdateModalOpen}
        initialValues={{
          value: currentRow?.value,
          status: currentRow?.status,
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
        <ProFormText
          rules={[
            {
              required: true,
              message: "待办事项的值不能为空",
            },
          ]}
          label={"事项"}
          colProps={{
            span: 18,
          }}
          name="value"
        />
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
        {currentRow?.value && (
          <ProDescriptions<API.TodoItem>
            column={2}
            title={currentRow?.value}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.value,
            }}
            columns={columns as ProDescriptionsItemProps<API.TodoItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
