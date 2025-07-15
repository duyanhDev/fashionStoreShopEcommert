import { Button, Flex, Table } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getVoucherAPI } from "../../service/APIVoucher,js";
import moment from "moment";
import { createStyles } from "antd-style";
import { useNavigate } from "react-router-dom";
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

const Voucher = () => {
  const { styles } = useStyle();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const start = () => {
    setLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const fetchApiVoucher = async () => {
    try {
      let res = await getVoucherAPI();
      console.log(res);

      if (res.data && res.data.EC === 0) {
        setData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchApiVoucher();
  }, []);
  const dataSource =
    data.length > 0 &&
    data.map((voucher, i) => ({
      id: i + 1,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,

      startDate: moment(voucher.startDate).format("DD-MM-YYYY"),
      endDate: moment(voucher.endDate).format("DD-MM-YYYY"),
      usageLimit: voucher.usageLimit,
      usedCount: voucher.usedCount,
      status: voucher.status === true ? "Hiệu lực" : "Không hiệu lực",
      userGroup: voucher.userGroup,
    }));
  const columns = [
    {
      title: "STT",
      dataIndex: "id",
    },
    {
      title: "Tên voucher",
      dataIndex: "code",
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discountType",
    },
    {
      title: "Giá trị giảm giá",
      dataIndex: "discountValue",
    },
    {
      title: "Giá trị đơn hàng tối thiểu",
      dataIndex: "minOrderValue",
    },

    {
      title: "Hiệu lực ",
      dataIndex: "startDate",
    },
    {
      title: "Kết thúc ",
      dataIndex: "endDate",
    },
    {
      title: "Giới hạn ",
      dataIndex: "usageLimit",
    },
    {
      title: "Số lần sử dụng ",
      dataIndex: "usedCount",
    },
    {
      title: "Voucher có hiệu lực",
      dataIndex: "status",
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
    },
    {
      title: "appliedUsers",
      dataIndex: "appliedUsers",
    },
    {
      title: "Nhóm khách hàng",
      dataIndex: "userGroup",
    },
    {
      title: "Hành động",
      key: "operation",
      fixed: "right",
      width: 100,
      render: () => (
        <Flex gap="small" justify="center" className="min-w-[110px]">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewNavigate(product._id)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 border-none rounded-full shadow-md transition-all duration-300 px-3 py-1"
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleNavigate(product._id)}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 border-none rounded-full shadow-md transition-all duration-300 px-3 py-1"
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 border-none rounded-full shadow-md transition-all duration-300 px-3 py-1"
          />
        </Flex>
      ),
    },
  ];
  return (
    <div className="w-full">
      <Flex gap="middle" vertical>
        <Flex align="center" gap="middle">
          <Button
            type="primary"
            onClick={start}
            disabled={!hasSelected}
            loading={loading}
          >
            Reload
          </Button>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}

          <Button
            type="primary"
            onClick={() => navigate("/admin/add-voucher")}
            className="bg-gradient-to-r from-green-500 to-lime-500 text-white hover:from-green-600 hover:to-lime-600 border-none rounded-full shadow-md transition-all duration-300 px-3 py-1"
          >
            Thêm voucher
          </Button>
        </Flex>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          className={styles.customTable}
          //   scroll={{
          //     x: "max-content",
          //   }}
        />
      </Flex>
    </div>
  );
};

export default Voucher;
