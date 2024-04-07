import { addNote, removeNote, queryNote, updateNote } from '@/services/note/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormSwitch,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, Drawer, Typography, message, Image } from 'antd';
import React, { useRef, useState } from 'react';

const handleAdd = async (fields: API.NoteItem) => {
  const hide = message.loading('正在添加');
  try {
    await addNote({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

const handleUpdate = async (fields: API.NoteItem) => {
  const hide = message.loading('Configuring');
  try {
    await updateNote(fields.id!, {
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

const handleRemove = async (selectedRows: API.NoteItem[]) => {
  console.log("🚀 ~ handleRemove ~ selectedRows:", selectedRows)
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeNote(selectedRows.map((row) => row.id));
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

  const [createModalOpen, handleModalOpen] = useState<boolean>(false);

  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.NoteItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.NoteItem[]>([]);

  const columns: ProColumns<API.NoteItem>[] = [
    {
      title: '图片',
      dataIndex: 'images',
      width: 120,
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <Image.PreviewGroup
            items={entity.images.map((item) => item.src)}
          >
            <Image
              width={120}
              height={120}
              src={entity.cover.src}
            />
            {showDetail && entity.images.slice(1).map((item, index) => (
              <Image
                key={index}
                width={120}
                height={120}
                src={item.src}
              />
            ))}
          </Image.PreviewGroup>
        );
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
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
      title: '内容',
      dataIndex: 'content',
      // width: 150,
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2, tooltip: true }} >
            {entity.content}
          </Typography.Paragraph>

        );
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      hideInForm: true,
      width: 100,
      valueEnum: {
        'Draft': {
          text: '草稿',
          status: 'Default',
        },
        'Audit': {
          text: '待审核',
          status: 'Processing',
        },
        'Published': {
          text: '已发布',
          status: 'Success',
        },
        'Rejected': {
          text: '已拒绝',
          status: 'Error',
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
    <PageContainer header={{ title: '图文管理' }}>
      <ProTable<API.NoteItem, API.PageParams>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        // toolBarRender={() => [
        //   <Button
        //     type="primary"
        //     key="primary"
        //     onClick={() => {
        //       handleModalOpen(true);
        //     }}
        //   >
        //     <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
        //   </Button>,
        // ]}
        request={queryNote}
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
      {/* <ModalForm
        title={'新建图文'}
        width="400px"
        layout="horizontal"
        grid
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.NoteItem);
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
              message: "图文的值不能为空",
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
      </ModalForm> */}

      <ModalForm
        title={'更新图文'}
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
          <ProDescriptions<API.NoteItem>
            column={1}
            title={currentRow?.title}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.title,
            }}
            columns={columns as ProDescriptionsItemProps<API.NoteItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
