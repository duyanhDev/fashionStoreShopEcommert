import { Button, Flex, Table } from "antd";
import { useEffect, useState } from "react";
import { getVoucherAPI } from "../../service/APIVoucher,js";
import moment from "moment";
import { createStyles } from "antd-style";
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
    title: "userGroup",
    dataIndex: "userGroup",
  },
  {
    title: "Action",
    key: "operation",
    fixed: "right",
    width: 100,
    render: () => <a>action</a>,
  },
];

const Voucher = () => {
  const { styles } = useStyle();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
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
    }));

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
