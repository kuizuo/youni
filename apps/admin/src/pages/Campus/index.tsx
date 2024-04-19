import { addCampus, removeCampus, queryCampus, updateCampus } from '@/services/campus/api';
import { getToken } from '@/utils/auth';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useNavigate } from '@umijs/max';
import { Button, Drawer, Image, message } from 'antd';
import React, { useRef, useState } from 'react';

const handleAdd = async (fields: API.CampusItem) => {
  const hide = message.loading('正在添加');
  try {
    await addCampus({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败!');
    return false;
  }
};

const handleUpdate = async (fields: API.CampusItem) => {
  const hide = message.loading('Configuring');
  try {
    await updateCampus(fields.id!, {
      name: fields.name,
    });
    hide();

    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

const handleRemove = async (selectedRows: API.CampusItem[]) => {
  console.log("🚀 ~ handleRemove ~ selectedRows:", selectedRows)
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeCampus(selectedRows.map((row) => row.id));
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
  const navigate = useNavigate();

  const [createModalOpen, handleModalOpen] = useState<boolean>(false);

  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.CampusItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.CampusItem[]>([]);

  const columns: ProColumns<API.CampusItem>[] = [
    {
      title: '校徽',
      dataIndex: 'logo',
      hideInSearch: true,
      width: 80,
      render: (dom, entity) => {
        return (
          <Image
            width={80}
            src={entity.logo}
          />

        );
      },
    },
    {
      title: '学校名',
      dataIndex: 'name',
      width: 200,
      align: 'center',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              navigate(`/campus/detail/${entity.id}`)
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      hideInSearch: true,
      align: 'center',
    },
    // {
    //   title: '别名',
    //   dataIndex: 'alias',
    //   hideInSearch: true,
    //   align: 'center',
    // },
    // {
    //   title: '位置',
    //   dataIndex: 'location',
    // },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 180,
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
    <PageContainer header={{ title: '校区管理' }} >
      <ProTable<API.CampusItem, API.PageParams>
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
        request={queryCampus}
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
        title={'新建校区'}
        width="400px"
        layout="horizontal"
        grid
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.CampusItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormUploadButton
          name="logo"
          label="校徽"
          max={1}
          rules={[
            {
              required: true,
              message: "校徽不能为空",
            },
          ]}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
            headers: {
              'Authorization': getToken()
            }
          }}
          action="/api/files/upload"
          transform={(file) => {
            return file?.[0].response.data.url
          }}
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: "校区的值不能为空",
            },
          ]}
          label={"校名"}
          colProps={{
            span: 24,
          }}
          name="name"
        />
        {/* <ProFormText
          label={"别名"}
          colProps={{
            span: 24,
          }}
          name="alias"
        /> */}
        <ProFormText
          label={"描述"}
          colProps={{
            span: 24,
          }}
          name="desc"
        />
      </ModalForm>

      <ModalForm
        title={'更新校区'}
        width="400px"
        layout="horizontal"
        grid
        open={updateModalOpen}
        onOpenChange={handleUpdateModalOpen}
        modalProps={{ destroyOnClose: true }}
        initialValues={{
          logo: currentRow?.logo,
          name: currentRow?.name,
          desc: currentRow?.desc,
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
        <ProFormUploadButton
          name="logo"
          label="校徽"
          max={1}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
            headers: {
              'Authorization': getToken()
            }
          }}
          action="/api/files/upload"
          convertValue={(value, field) => {
            return [{ url: value }]
          }}
        // transform={(file) => {
        //   return file?.[0].response.data.url
        // }}
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: "校区的值不能为空",
            },
          ]}
          label={"校名"}
          colProps={{
            span: 24,
          }}
          name="name"
        />
        {/* <ProFormText
          label={"别名"}
          colProps={{
            span: 24,
          }}
          name="alias"
        /> */}
        <ProFormText
          label={"描述"}
          colProps={{
            span: 24,
          }}
          name="desc"
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
        {currentRow?.name && (
          <ProDescriptions<API.CampusItem>
            column={1}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.CampusItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
