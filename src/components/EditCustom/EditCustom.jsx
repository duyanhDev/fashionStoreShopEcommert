import {
  Input,
  Select,
  Form,
  Card,
  Upload,
  Button,
  Avatar,
  DatePicker,
  message,
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { get_profile_user, update_profileAdmin } from "../../service/Auth";
import moment from "moment";
import { useSelector } from "react-redux";

const { Option } = Select;

const EditCustom = () => {
  const [formData, setFormData] = useState({
    email: "",
    customerName: "",
    gender: "",
    height: "",
    weight: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    role: "customer",
    avatar: "",
    dateOfBirth: "",
    permissions: "",
  });

  const { id } = useParams();
  const formattedDate = moment(formData.dateOfBirth).format("DD-MM-YYYY");
  const { user } = useSelector((state) => state.auth);

  const [ProvineData, SetProvineData] = useState([]);
  const [SeletectIdProvine, SetSeletectIdProvine] = useState("");

  const [districtData, SetDistrictData] = useState([]);
  const [SeletectIdDistrict, SetSeletectIdDistrict] = useState("");

  const [WarmData, setWarmData] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const fetchDataUser = async () => {
    try {
      let res = await get_profile_user(id);

      if (res && res.data && res.data.EC === 0) {
        const data = res.data.data;

        setFormData({
          email: data.email || "",
          customerName: data.name || "",
          gender: data.gender || "",
          height: data.height || "",
          weight: data.weight || "",
          phone: data.phone || "",
          city: data.address && data.address.city ? data.address.city : "",
          district:
            data.address && data.address.district ? data.address.district : "",
          ward: data.address && data.address.ward ? data.address.ward : "",
          dateOfBirth: data.dateOfBirth || "",

          role: data.role || "customer",
          permissions: data.permissions || "",
          avatar: data.avatar || "",
        });

        // Set ID tỉnh/thành và quận/huyện nếu cần
        const selectedCity = ProvineData.find(
          (item) => item.name === data.city
        );
        if (selectedCity) SetSeletectIdProvine(selectedCity.id);

        const selectedDistrict = districtData.find(
          (item) => item.name === data.district
        );
        if (selectedDistrict) SetSeletectIdDistrict(selectedDistrict.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const FetchDataProvince = async () => {
    let api =
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province";
    let res = await axios.get(api, {
      headers: { Token: "6501032d-0b70-11ef-b1d4-92b443b7a897" },
    });
    if (res.data && res.data.data) {
      const dataProvines = res.data.data.map((data) => ({
        id: data.ProvinceID,
        name: data.ProvinceName,
      }));
      SetProvineData(dataProvines);
    }
  };

  const FetchDataDistrict = async () => {
    if (!SeletectIdProvine) {
      SetDistrictData([]);
      setWarmData([]);
      return;
    }
    try {
      let url = `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${SeletectIdProvine}`;
      let res = await axios.get(url, {
        headers: { Token: "6501032d-0b70-11ef-b1d4-92b443b7a897" },
      });
      if (res.data && res.data.data) {
        const data = res.data.data.map((item) => ({
          id: item.DistrictID,
          name: item.DistrictName,
        }));
        SetDistrictData(data);
        setWarmData([]); // Reset ward list khi load district mới
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      SetDistrictData([]);
      setWarmData([]);
    }
  };

  const FetchDataWarn = async () => {
    if (!SeletectIdDistrict) {
      setWarmData([]);
      return;
    }
    try {
      let url = `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${SeletectIdDistrict}`;
      let res = await axios.get(url, {
        headers: { Token: "6501032d-0b70-11ef-b1d4-92b443b7a897" },
      });
      if (res.data && res.data.data) {
        const data = res.data.data.map((item) => ({
          id: item.WardCode,
          name: item.WardName,
        }));
        setWarmData(data);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWarmData([]);
    }
  };

  useEffect(() => {
    fetchDataUser();
  }, [id]);

  useEffect(() => {
    FetchDataProvince();
  }, []);

  useEffect(() => {
    FetchDataDistrict();
  }, [SeletectIdProvine]);

  useEffect(() => {
    FetchDataWarn();
  }, [SeletectIdDistrict]);

  const handleChange = (field) => (e) => {
    const value = e?.target?.value ?? e;

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = ({ file, onSuccess }) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);

      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        avatar: imageUrl || "",
      }));
      onSuccess("ok"); // Gọi callback thành công
    }
  };

  const handleChangeCity = (value) => {
    const selected = ProvineData.find((item) => item.id === value);
    SetSeletectIdProvine(value);
    setFormData((prev) => ({
      ...prev,
      city: selected?.name || "",
    }));
  };

  const handleChangeDistrict = (value) => {
    const selected = districtData.find((item) => item.id === value);
    SetSeletectIdDistrict(value);
    setFormData((prev) => ({
      ...prev,
      district: selected?.name || "",
    }));
  };

  const handleChangeWard = (value) => {
    const selected = WarmData.find((item) => item.id === value);
    setFormData((prev) => ({
      ...prev,
      ward: selected?.name || "",
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: date ? date.format("YYYY-MM-DD") : "",
    }));
  };

  const handleUpdateUser = async () => {
    if (user.role !== "admin") {
      message.error("Bạn không có quyền chỉnh sửa thông tin này");
      return;
    }

    try {
      const res = await update_profileAdmin(
        id,
        formData.customerName,
        formData.city,
        formData.district,
        formData.ward,
        formData.phone,
        formData.gender,
        formData.dateOfBirth,
        formData.height,
        formData.weight,
        formData.role,
        formData.permissions,
        selectedImage
      );

      if (res) {
        message.success("Profile updated successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card
        title="Chỉnh sửa thông tin khách hàng"
        className="shadow-xl rounded-2xl border border-gray-200"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Ảnh đại diện */}
          <div className="flex flex-col items-center gap-4 md:w-1/3">
            <div className="w-40 h-40 rounded-full overflow-hidden border shadow-md">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  No image
                </div>
              )}
            </div>
            <Upload showUploadList={false} customRequest={handleImageChange}>
              <Button icon={<UploadOutlined />} className="rounded-full">
                Tải ảnh lên
              </Button>
            </Upload>
          </div>

          {/* Thông tin form */}
          <div className="md:w-3/4">
            <Form
              layout="vertical"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Form.Item label="Email">
                <Input
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  disabled
                />
              </Form.Item>

              <Form.Item label="Họ và tên">
                <Input
                  placeholder="Nhập tên"
                  value={formData.customerName}
                  onChange={handleChange("customerName")}
                />
              </Form.Item>
              <Form.Item label="Số điện thoại">
                <Input
                  type="number"
                  placeholder="Nhập Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                />
              </Form.Item>

              <Form.Item label="Ngày sinh">
                <DatePicker
                  value={
                    formData.dateOfBirth ? moment(formData.dateOfBirth) : null
                  }
                  format="DD-MM-YYYY"
                  onChange={handleDateChange}
                />
              </Form.Item>
              <Form.Item label="Giới tính">
                <Select
                  placeholder="Chọn giới tính"
                  value={formData.gender}
                  onChange={handleChange("gender")}
                >
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Chiều cao(cm)">
                <Input
                  type="number"
                  placeholder="VD: 170 cm"
                  value={formData.height}
                  onChange={handleChange("height")}
                />
              </Form.Item>

              <Form.Item label="Cân nặng(kg)">
                <Input
                  type="number"
                  placeholder="VD: 60kg"
                  value={formData.weight}
                  onChange={handleChange("weight")}
                />
              </Form.Item>

              <Form.Item label="Thành phố">
                <Select
                  placeholder="Chọn thành phố"
                  value={formData.city}
                  onChange={handleChangeCity}
                >
                  {ProvineData &&
                    ProvineData?.map((provine) => {
                      return (
                        <Option key={provine.id} value={provine.id}>
                          {provine.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>

              <Form.Item label="Quận/Huyện">
                <Select
                  placeholder="Chọn Quận/Huyện"
                  value={formData.district}
                  onChange={handleChangeDistrict}
                >
                  {districtData &&
                    districtData?.map((district) => {
                      return (
                        <Option key={district.id} value={district.id}>
                          {district.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>

              <Form.Item label="Phường/Xã">
                <Select
                  placeholder="Chọn xã"
                  value={formData.ward}
                  onChange={handleChangeWard}
                >
                  {WarmData &&
                    WarmData?.map((ward) => {
                      return (
                        <Option key={ward.id} value={ward.id}>
                          {ward.name}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>

              <Form.Item label="Quyền">
                <Select
                  placeholder="Chọn quyền"
                  value={formData.role}
                  onChange={handleChange("role")}
                >
                  <Option value="admin">Quản trị viên</Option>
                  <Option value="customer">Người dùng</Option>
                  <Option value="staff">Nhân viên</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Quyền">
                <Select
                  placeholder="Chọn quyền"
                  value={formData.permissions}
                  onChange={handleChange("permissions")}
                >
                  <Option value="order_approval">Nhân viên đơn hàng</Option>
                  <Option value="customer_support">
                    Nhân viên tư vấn hỗ trợ
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item label="Mật khẩu">
                <Input
                  type="number"
                  value="**************"
                  placeholder="****************************"
                  disabled
                />
              </Form.Item>
            </Form>

            <div className="flex justify-end mt-6">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                className="px-8 py-2 rounded-lg shadow-lg"
                onClick={() => handleUpdateUser()}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditCustom;
