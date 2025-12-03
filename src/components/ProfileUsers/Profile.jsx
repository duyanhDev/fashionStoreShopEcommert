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
import { useDispatch, useSelector } from "react-redux";
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
import { logout, updateUser } from "../../redux/actions/Auth";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const PersonalInfoForm = ({ id }) => {
  const [form] = Form.useForm();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassWord, setNewPassword] = useState("");
  const [confirmPassWord, setConfirmPassword] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const [validationStatus, setValidationStatus] = useState({
    newPassWord: { isValid: false, errors: [], requirements: [] },
    confirmPassword: { isValid: false, errors: [], requirements: [] },
  });

  // Validate mật khẩu mới
  const validateNewPassword = (password) => {
    const requirements = [
      { text: "Ít nhất 8 ký tự", check: password.length >= 8 },
      { text: "Có ít nhất 1 chữ hoa", check: /[A-Z]/.test(password) },
      { text: "Có ít nhất 1 chữ thường", check: /[a-z]/.test(password) },
      { text: "Có ít nhất 1 số", check: /\d/.test(password) },
      {
        text: "Có ít nhất 1 ký tự đặc biệt",
        check: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ];

    const failedRequirements = requirements.filter((req) => !req.check);
    const isValid = failedRequirements.length === 0;

    return {
      isValid,
      errors: failedRequirements.map((req) => req.text),
      requirements,
    };
  };

  // Validate xác nhận mật khẩu
  const validateConfirmPass = (newPass, confirmPass) => {
    const requirements = [
      { text: "Không được để trống", check: confirmPass.trim().length > 0 },
      {
        text: "Phải trùng với mật khẩu mới",
        check: newPass === confirmPass && newPass.length > 0,
      },
    ];

    const failedRequirements = requirements.filter((req) => !req.check);
    const isValid = failedRequirements.length === 0;

    return {
      isValid,
      errors: failedRequirements.map((req) => req.text),
      requirements,
    };
  };

  // Cập nhật validation khi thay đổi input
  useEffect(() => {
    if (newPassWord) {
      const newPassValidation = validateNewPassword(newPassWord);
      setValidationStatus((prev) => ({
        ...prev,
        newPassWord: newPassValidation,
      }));
    }

    if (confirmPassWord || newPassWord) {
      const confirmValidation = validateConfirmPass(
        newPassWord,
        confirmPassWord
      );
      setValidationStatus((prev) => ({
        ...prev,
        confirmPassword: confirmValidation,
      }));
    }
  }, [newPassWord, confirmPassWord]);

  const handleUpdatePassWord = async () => {
    try {
      // Validate form của Ant Design
      await form.validateFields();

      // Validate custom
      const newPassValidation = validateNewPassword(newPassWord);
      const confirmValidation = validateConfirmPass(
        newPassWord,
        confirmPassWord
      );

      if (!newPassValidation.isValid) {
        api["error"]({
          message: "Lỗi mật khẩu mới",
          description: newPassValidation.errors.join(", "),
        });
        return;
      }

      if (!confirmValidation.isValid) {
        api["error"]({
          message: "Lỗi xác nhận mật khẩu",
          description: confirmValidation.errors.join(", "),
        });
        return;
      }

      const res = await ChanglePasswordAPI(id, currentPassword, newPassWord);

      if (res && res.data.success === true) {
        api["success"]({
          message: "Cập nhật mật khẩu thành công",
          description: "Bạn đã cập nhật thành công mật khẩu mới",
        });

        // Reset form
        form.resetFields();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      if (error.errorFields) {
        // Lỗi validation của form
        api["error"]({
          message: "Thông báo",
          description: "Vui lòng nhập đầy đủ thông tin hợp lệ",
        });
      } else if (error.response) {
        // Lỗi từ API
        api["error"]({
          message: "Thông báo lỗi",
          description: error.response.data.message || "Có lỗi xảy ra",
        });
      } else {
        // Lỗi khác
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
        <Form form={form} layout="vertical">
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
              placeholder="Nhập mật khẩu cũ"
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
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const validation = validateNewPassword(value);
                  if (validation.isValid) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(validation.errors[0]));
                },
              },
            ]}
            hasFeedback
            validateStatus={
              newPassWord && !validationStatus.newPassWord.isValid
                ? "error"
                : ""
            }
          >
            <Input.Password
              value={newPassWord}
              onChange={(e) => setNewPassword(e.target.value)}
              size="large"
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          {/* Hiển thị yêu cầu mật khẩu */}
          {newPassWord &&
            validationStatus.newPassWord.requirements.length > 0 && (
              <div style={{ marginTop: -16, marginBottom: 16 }}>
                {validationStatus.newPassWord.requirements.map((req, index) => (
                  <div
                    key={index}
                    style={{
                      color: req.check ? "#52c41a" : "#ff4d4f",
                      fontSize: 12,
                    }}
                  >
                    {req.check ? "✓" : "✗"} {req.text}
                  </div>
                ))}
              </div>
            )}

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
              placeholder="Xác nhận mật khẩu mới"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              className="w-full"
              size="large"
              onClick={handleUpdatePassWord}
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
  const dispatch = useDispatch();

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
  const [error, setError] = useState("");
  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();
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

  const FeachDataDistrict = async () => {
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

  const FeachDataWarn = async () => {
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
    FetchDataProvince();
  }, []);

  useEffect(() => {
    FeachDataDistrict();
  }, [SeletectIdProvine]);

  useEffect(() => {
    FeachDataWarn();
  }, [SeletectIdDistrict]);

  const handleOnChangeProvine = (value, name) => {
    const selected = ProvineData.find((item) => item.id === value);
    SetSeletectIdProvine(value);
    setCity(selected?.name || "");
  };

  const handleOnChangeDistrict = (value, name) => {
    const selected = districtData.find((item) => item.id === value);
    SetSeletectIdDistrict(value);
    setdistrict(selected?.name || "");
  };

  const handleOnChangeWarm = (value, name) => {
    const selected = WarmData.find((item) => item.id === value);
    SetSeletectIdWarm(value);
    setward(selected?.name || "");
  };

  const handleChange = (e) => {
    const value = e.target.value;

    if (value.length > 16) {
      setError("Tên không được vượt quá 16 ký tự!");
    } else {
      setError("");
    }

    setName(value);
  };
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
              onChange={handleChange}
              placeholder="Đặng Trịnh Duy Anh"
              className={error ? "border-red-500" : ""}
              maxLength={17}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
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
              type="number"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 10) {
                  setPhone(value);
                }
              }}
              status={phone.length !== 10 ? "error" : ""} // bắt buộc phải đủ 10 số
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
                      <Option key={provine.id} value={provine.id}>
                        {provine.name}
                      </Option>
                    );
                  })}
              </Select>
            </div>

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
            </div>

            <div className="profile-form-item">
              <label>Phường/Xã</label>
              <Select
                size="large"
                placeholder="Chọn xã"
                value={ward}
                onChange={handleOnChangeWarm}
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
      if (phone.length < 10) {
        api["warning"]({
          message: "Vui lòng kiểm tra lại số điện thoại!",
          description: "Số điện thoại phải đủ 10 chữ số!",
          placement: "topRight",
        });
        return;
      }

      if (
        selectedDate < moment("01-01-1900", "DD-MM-YYYY") ||
        selectedDate > moment()
      ) {
        api["warning"]({
          message: "Vui lòng kiểm tra lại ngày sinh!",
          description: "Ngày sinh không hợp lệ!",
        });
        return;
      }
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
        user.permissions,
        selectedImage
      );

      if (res && res.message === "Cập nhật thành công") {
        api["success"]({
          message: "Cập nhật thông tin thành công",
          description: "Bạn đã cập nhật thông tin cá nhân thành công",
          placement: "topRight",
        });
        dispatch(updateUser(res.user)); // avatar + info khác sẽ cập nhật ngay
        setOpenResponsive(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogOut = async () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/login");
  };

  const handleNavigate = (href) => {
    if (href === "/login") {
      handleLogOut();
    } else {
      navigate(href);
    }
  };
  return (
    <div className="main_profile fade-in">
      {contextHolder}
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
            <p className="sm:mt-8 responsive-text text-[#00000099] mb-2">
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
            {
              img: img5,
              text: "Thông tin tài khoản",
              href: `/profile/${user?.name}`,
            },
            { img: img4, text: "Lịch Sử đơn hàng", href: "/order" },
            { img: img1, text: "Sản phẩm yêu thích", href: "/wishlist" },
            { img: img2, text: "Voucher", href: "/voucher-wallet" },
            { img: img3, text: "Đăng xuất", href: "/login" },
          ].map((item, index) => (
            <p
              key={index}
              className="fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleNavigate(item.href)}
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
