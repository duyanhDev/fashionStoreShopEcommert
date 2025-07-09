"use client";

import "./Profile.css";
import logo_user from "./../../assets/Image/mceclip0_92.png";
import silver from "./../../assets/Image/mceclip0_56.png";
import gold from "./../../assets/Image/mceclip3_45.png";
import palatium from "./../../assets/Image/mceclip1_32.png";
import img1 from "./../../assets/Image/mceclip3_71 (1).png";
import img2 from "./../../assets/Image/mceclip4_7_cart.png";
import img3 from "./../../assets/Image/mceclip4_6.png";
import img4 from "./../../assets/Image/mceclip5_85.png";
import img5 from "./../../assets/Image/mceclip6_34.png";
import img6 from "./../../assets/Image/mceclip1_37.png";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "./../../untils/axios";

import {
  ChanglePasswordAPI,
  get_profile_user,
  update_profileUser,
} from "../../service/Auth";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  notification,
  Select,
  Tabs,
} from "antd";
import moment from "moment";

const { Option } = Select;

const PersonalInfoForm = ({ id }) => {
  const [form] = Form.useForm();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassWord, setNewPassword] = useState("");
  const [confirmPassWord, setConfirmPassword] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  const handleUpdatePassWord = async () => {
    try {
      // Validate form fields
      await form.validateFields();

      const values = form.getFieldsValue();
      if (!values.passworded || !values.password || !values.confirm) {
        api["error"]({
          message: "Thông báo",
          description: "Vui lòng nhập đầy đủ thông tin",
        });
        return;
      }

      // Call API
      const res = await ChanglePasswordAPI(id, currentPassword, newPassWord);

      if (res && res.data.success === true) {
        api["success"]({
          message: "Cập nhật mật khẩu thành công",
          description: "Bạn đã cập nhật thành công mật khẩu mới",
        });
      }
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        api["error"]({
          message: "Thông báo",
          description: "Vui lòng nhập đầy đủ thông tin",
        });
      } else if (error.response) {
        // Error from API
        api["error"]({
          message: "Thông báo lỗi",
          description: error.response.data.message || "Có lỗi xảy ra",
        });
      } else {
        // Other errors
        api["error"]({
          message: "Lỗi",
          description: "Có lỗi xảy ra, vui lòng thử lại sau",
        });
      }
      console.error("Error:", error);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="profile-form-container">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="passworded"
            label="Mật khẩu cũ"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu cũ!",
              },
              {
                min: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự!",
              },
            ]}
            hasFeedback
          >
            <Input.Password
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu mới!",
              },
              {
                min: 6,
                message: "Mật khẩu mới phải có ít nhất 6 ký tự!",
              },
            ]}
            hasFeedback
          >
            <Input.Password
              value={newPassWord}
              onChange={(e) => setNewPassword(e.target.value)}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Nhập lại mật khẩu mới"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận lại mật khẩu mới!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp với mật khẩu mới!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              value={confirmPassWord}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              className="w-full"
              size="large"
              htmlType="submit"
              onClick={() => handleUpdatePassWord()}
            >
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  console.log(user);

  const id = user._id;

  const [points, setPoints] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dateBrith, setDateBrith] = useState("");
  const [phone, setPhone] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [image, setImage] = useState(null);
  const [city, setCity] = useState("");
  const [district, setdistrict] = useState("");
  const [ward, setward] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ImageUpLoad, SetImageUpLoad] = useState("");

  const [openResponsive, setOpenResponsive] = useState(false);
  const [password, setPassword] = useState("");
  const bac = 1000000;
  const vang = 3000000;
  const bachkim = 10000000;

  const inputDate = moment(dateBrith);
  const formattedDate = moment(dateBrith).format("DD-MM-YYYY");

  const [selectedDate, setSelectedDate] = useState(formattedDate);

  // tỉnh huyện xã
  const [ProvineData, SetProvineData] = useState([]);
  const [SeletectIdProvine, SetSeletectIdProvine] = useState("");
  const [districtData, SetDistrictData] = useState([]);
  const [SeletectIdDistrict, SetSeletectIdDistrict] = useState("");
  const [WarmData, setWarmData] = useState([]);
  const [SeletectIdWarm, SetSeletectIdWarm] = useState("");

  /// Check time
  useEffect(() => {
    if (inputDate.isValid()) {
      setSelectedDate(inputDate);
    } else {
      setSelectedDate(null);
    }
  }, [dateBrith]);

  const onChangeDateTime = (date, dateString) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // update anh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      SetImageUpLoad(file.name);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);

      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0đ";
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const FetchDataProfile = async () => {
    try {
      const res = await get_profile_user(id);
      if (res && res.data && res.data.EC === 0) {
        setName(res.data.data.name || "");
        setEmail(res.data.data.email || "");
        setPoints(res.data.data.totalPrice || "");
        setPassword(res.data.data.password || "");
        setCity(res.data.data.address.city || "");
        setdistrict(res.data.data.address.district || "");
        setward(res.data.data.address.ward || "");
        setGender(res.data.data.gender || "");
        setDateBrith(res.data.data.dateOfBirth || "");
        setHeight(res.data.data.height || "");
        setWeight(res.data.data.weight || "");
        setPhone(res.data.data.phone || "");
        setImage(res.data.data.avatar || null);
      }
    } catch (error) {}
  };

  useEffect(() => {
    FetchDataProfile();
  }, []);

  const onChange = (key) => {
    console.log(key);
  };

  const FetchDataProvince = async () => {
    const url = "https://vietnamlabs.com/api/vietnamprovince";

    const res = await axios.get(url);

    if (res && res.data && res.data.data) {
      const data = res.data.data;
      SetProvineData(data);
    }
  };

  // const FeachDataDistrict = async () => {
  //   const url = `https://esgoo.net/api-tinhthanh/2/${SeletectIdProvine}.htm`;

  //   const res = await axios.get(url);

  //   if (res && res.data && res.data.data) {
  //     const data = res.data.data;
  //     SetDistrictData(data);
  //   }
  // };

  const FeachDataWarn = async () => {
    const url = `https://vietnamlabs.com/api/vietnamprovince?province=${city}`;
    const res = await axios.get(url);

    if (res && res.data && res.data.data) {
      const data = res.data.data;
      setWarmData(data);
    }
  };

  const handleOnChangeProvine = (value, name) => {
    const selected = ProvineData.find((item) => item.province === value);
    SetSeletectIdProvine(value);
    setCity(selected?.province || "");
  };

  const handleOnChangeDistrict = (value, name) => {
    const selected = districtData.find((item) => item.id === value);
    SetSeletectIdDistrict(value);
    setdistrict(selected?.name || "");
  };

  const handleOnChangeWarm = (value, name) => {
    // Tìm tỉnh hiện tại được chọn
    const selectedProvince = ProvineData.find(
      (province) => province.province === SeletectIdProvine
    );

    if (!selectedProvince) {
      console.warn("Không tìm thấy tỉnh:", SeletectIdProvine);
      return;
    }

    // Tìm ward trong tỉnh đã chọn
    const selectedWard = selectedProvince.wards.find(
      (ward) => ward.name === value
    );

    SetSeletectIdWarm(value);
    setward(selectedWard?.name || "");
  };

  useEffect(() => {
    FetchDataProvince();
  }, []);

  // useEffect(() => {
  //   FeachDataDistrict();
  // }, [SeletectIdProvine]);

  useEffect(() => {
    FeachDataWarn();
  }, [city]);

  const items = [
    {
      key: "1",
      label: "Cập nhật thông tin cá nhân",
      children: (
        <div className="profile-form-container">
          {/* Full Name Input */}
          <div className="profile-form-item">
            <label>Họ tên của bạn</label>
            <Input
              size="large"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Đặng Trịnh Duy Anh"
            />
          </div>

          {/* Date Selection */}
          <div className="profile-form-item">
            <label>Năm Sinh</label>
            <DatePicker
              size="large"
              value={selectedDate}
              format="DD-MM-YYYY"
              onChange={onChangeDateTime}
              style={{ width: "100%" }}
            />
          </div>

          {/* Gender Selection */}
          <div className="profile-form-item">
            <label>Giới tính</label>
            <div className="flex gap-4 mt-2">
              {["Nam", "Nữ"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    className="w-4 h-4 text-blue-600"
                    checked={item === gender}
                    onChange={() => setGender(item)}
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phone Input */}
          <div className="profile-form-item">
            <label>Số điện thoại</label>
            <Input
              size="large"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
            />
          </div>

          {/* Height Slider */}
          <div className="profile-form-item">
            <div className="flex justify-between mb-2">
              <label>Chiều cao</label>
              <span className="text-sm font-medium">{height}cm</span>
            </div>
            <input
              type="range"
              min="140"
              max="200"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Weight Slider */}
          <div className="profile-form-item">
            <div className="flex justify-between mb-2">
              <label>Cân nặng</label>
              <span className="text-sm font-medium">{weight}kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="120"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Address Selection */}
          <div className="profile-form-row">
            <div className="profile-form-item">
              <label>Thành phố</label>
              <Select
                size="large"
                value={city}
                onChange={handleOnChangeProvine}
                placeholder="Chọn thành phố"
              >
                {ProvineData &&
                  ProvineData?.map((provine) => {
                    return (
                      <Option key={provine.province} value={provine.province}>
                        {provine.province}
                      </Option>
                    );
                  })}
              </Select>
            </div>
            {/* 
            <div className="profile-form-item">
              <label>Quận/Huyện</label>
              <Select
                size="large"
                placeholder="Chọn Quận/Huyện"
                value={district}
                onChange={handleOnChangeDistrict}
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
            </div> */}

            <div className="profile-form-item">
              <label>Phường/Xã</label>
              <Select
                size="large"
                placeholder="Chọn xã"
                value={ward}
                onChange={handleOnChangeWarm}
              >
                {ProvineData &&
                  ProvineData.filter(
                    (province) => province.province === SeletectIdProvine
                  ).flatMap((province) =>
                    province.wards.map((ward) => (
                      <Option key={ward.name} value={ward.name}>
                        {ward.name}
                      </Option>
                    ))
                  )}
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="image-upload-container">
            <div className="mb-3">
              <h3 className="responsive-subtitle">Tải lên hình ảnh</h3>
              <p className="text-sm text-gray-500">
                Chọn hoặc kéo thả hình ảnh
              </p>
            </div>

            <div
              className={`image-upload-area ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-blue-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!previewUrl ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <svg
                      className="w-12 h-12 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M12 8v8m-4-4h8" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Kéo thả hình ảnh vào đây hoặc
                    </p>
                    <label className="inline-block">
                      <span className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                        Chọn tệp
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="image-preview mx-auto"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {selectedImage && (
              <div className="mt-3">
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <path d="M17 8l-5-5-5 5" />
                        <path d="M12 3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => console.log("Upload image:", selectedImage)}
                  >
                    Tải lên
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Cập nhật mật khẩu",
      children: <PersonalInfoForm id={id} />,
    },
  ];

  const handleUpdateProfileUser = async () => {
    try {
      const res = await update_profileUser(
        id,
        name,
        city,
        district,
        ward,
        phone,
        gender,
        selectedDate,
        height,
        weight,
        user.role,
        selectedImage
      );
      if (res) {
        message.success("Profile updated successfully");
        setOpenResponsive(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="main_profile fade-in">
      {/* User Info Header */}
      <div className="info-name">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex-1">
            <h1 className="responsive-title text-[#231f20] mb-4">HI, {name}</h1>

            {/* Tier Badge */}
            <div className="mb-4">
              {points >= bachkim ? (
                <img
                  src={palatium || "/placeholder.svg"}
                  alt="Bạch kim"
                  className="icon_users"
                />
              ) : points >= vang ? (
                <img
                  src={gold || "/placeholder.svg"}
                  alt="Vàng"
                  className="icon_users"
                />
              ) : points >= bac ? (
                <img
                  src={silver || "/placeholder.svg"}
                  alt="Bạc"
                  className="icon_users"
                />
              ) : (
                <img
                  src={logo_user || "/placeholder.svg"}
                  alt="Mới"
                  className="icon_users"
                />
              )}
            </div>

            {/* Progress Info */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <p className="responsive-text flex flex-wrap items-center gap-1">
                <span>Chi tiêu thêm</span>
                <b className="text-blue-500 font-bold">
                  {points >= bachkim
                    ? formatPrice(0)
                    : points >= vang
                    ? `${formatPrice(bachkim - points)}`
                    : points >= bac
                    ? `${formatPrice(vang - points)}`
                    : `${formatPrice(bac - points)}`}
                </b>
                <span>để lên hạng</span>
                <b className="text--outline font-bold">
                  <div className="mt-1">
                    {points >= bachkim ? (
                      <img
                        src={palatium || "/placeholder.svg"}
                        alt="Bạch kim"
                        className="w-16 h-auto"
                      />
                    ) : points >= vang ? (
                      <img
                        src={palatium || "/placeholder.svg"}
                        alt="Bạch kim"
                        className="w-16 h-auto"
                      />
                    ) : points >= bac ? (
                      <img
                        src={gold || "/placeholder.svg"}
                        alt="Vàng"
                        className="w-16 h-auto"
                      />
                    ) : (
                      <img
                        src={silver || "/placeholder.svg"}
                        alt="Bạc"
                        className="w-16 h-auto"
                      />
                    )}
                  </div>
                </b>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <span
                className={`account-line_value ${
                  points >= bachkim
                    ? "active platinum"
                    : points >= vang
                    ? "active gold"
                    : points >= bac
                    ? "active silver"
                    : points > 0
                    ? "active new"
                    : ""
                }`}
              ></span>
              <span className="account-line__text absolute">
                <img
                  src={logo_user || "/placeholder.svg"}
                  className="h-auto w-16 object-cover"
                  style={{ height: "26px" }}
                />
              </span>
              <span className="account-line__text account-line_hangbac absolute">
                <img
                  src={silver || "/placeholder.svg"}
                  className="h-auto w-16 object-cover"
                  style={{ height: "26px" }}
                />
              </span>
              <span className="account-line__text account-line_hangvang absolute">
                <img
                  src={gold || "/placeholder.svg"}
                  className="object-cover"
                  style={{ width: "72px", height: "26px" }}
                />
              </span>
              <span className="account-line__text account-line_hangbachkim absolute">
                <img
                  src={palatium || "/placeholder.svg"}
                  className="object-cover palatium"
                  style={{ width: "202px", height: "26px" }}
                />
              </span>
            </div>
          </div>

          {/* Total Spending */}
          <div className="text-center lg:text-right">
            <p className="responsive-text text-[#00000099] mb-2">
              Tổng chi tiêu
            </p>
            <p className="responsive-title text-[#000000]">
              {formatPrice(points || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="profile_username">
        {/* Navigation Menu */}
        <div className="account_list_btn">
          {[
            { img: img5, text: "Thông tin tài khoản" },
            { img: img4, text: "Lịch Sử đơn hàng" },
            { img: img1, text: "Lịch sử mua sắm" },
            { img: img2, text: "Đánh giá phản hồi" },
            { img: img6, text: "Yêu thích" },
            { img: img3, text: "Đăng xuất" },
          ].map((item, index) => (
            <p
              key={index}
              className="fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img src={item.img || "/placeholder.svg"} alt={item.text} />
              <span>{item.text}</span>
            </p>
          ))}
        </div>

        {/* Profile Information */}
        <div className="profile-content">
          <div className="account-image">
            <h1 className="responsive-subtitle">Thông tin tài khoản</h1>
            <img src={image || "/placeholder.svg"} alt="Avatar" />
          </div>

          <div className="account-profile_check">
            <div className="profile-info-row">
              <span>Họ Và Tên</span>
              <span>{name}</span>
            </div>

            <div className="profile-info-row">
              <span>Số điện thoại</span>
              <span>{phone}</span>
            </div>

            <div className="profile-info-row">
              <span>Giới tính</span>
              <span>{gender}</span>
            </div>

            <div className="profile-info-row">
              <span>
                Ngày sinh<span className="text-xs ml-1">(ngày/tháng/năm)</span>
              </span>
              <span>{formattedDate}</span>
            </div>

            <div className="profile-info-row">
              <span>Chiều cao</span>
              <span>{height}cm</span>
            </div>

            <div className="profile-info-row">
              <span>Cân nặng</span>
              <span>{weight}kg</span>
            </div>

            <div className="profile-info-row">
              <span>Tỉnh/Thành Phố</span>
              <span>{city}</span>
            </div>

            <div className="profile-info-row">
              <span>Quận/Huyện</span>
              <span>{district}</span>
            </div>

            <div className="profile-info-row">
              <span>Phường/Xã</span>
              <span>{ward}</span>
            </div>

            <div className="profile-info-row">
              <span>Email</span>
              <span>{email}</span>
            </div>

            <div className="profile-info-row">
              <span>Mật khẩu</span>
              <span>*******************</span>
            </div>

            <div className="mt-6">
              <Button
                type="primary"
                size="large"
                onClick={() => setOpenResponsive(true)}
                className="w-full"
              >
                Cập Nhật
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <Modal
        title="Thông tin tài khoản"
        centered
        open={openResponsive}
        onCancel={() => setOpenResponsive(false)}
        footer={
          <Button
            type="primary"
            size="large"
            onClick={() => handleUpdateProfileUser()}
          >
            Cập Nhật
          </Button>
        }
        width="90%"
        style={{ maxWidth: "800px" }}
      >
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </Modal>
    </div>
  );
};

export default Profile;
