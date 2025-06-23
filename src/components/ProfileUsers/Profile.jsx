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
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="passworded"
          label="Mật khẩu cũ"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
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
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu mới"
          value={newPassWord}
          onChange={(e) => setNewPassword(e.target.value)}
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
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Nhập lại mật khẩu mới"
          dependencies={["password"]}
          value={confirmPassWord}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button
            className="w-full h-10"
            htmlType="submit"
            onClick={() => handleUpdatePassWord()}
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
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
    let url = "https://esgoo.net/api-tinhthanh/1/0.htm";

    let res = await axios.get(url);

    if (res && res.data && res.data.data) {
      let data = res.data.data;
      SetProvineData(data);
    }
  };

  const FeachDataDistrict = async () => {
    let url = `https://esgoo.net/api-tinhthanh/2/${SeletectIdProvine}.htm`;

    let res = await axios.get(url);

    if (res && res.data && res.data.data) {
      let data = res.data.data;
      SetDistrictData(data);
    }
  };

  const FeachDataWarn = async () => {
    let url = `https://esgoo.net/api-tinhthanh/3/${SeletectIdDistrict}.htm`;
    let res = await axios.get(url);

    if (res && res.data && res.data.data) {
      let data = res.data.data;
      setWarmData(data);
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

  const items = [
    {
      key: "1",
      label: "Cập nhật thông tin cá nhân",
      children: (
        <>
          <div className="max-w-xl mx-auto p-6 space-y-6">
            {/* Full Name Input */}
            <div className="relative">
              <label className="text-sm text-gray-600">Họ tên của bạn</label>
              <input
                type="text"
                className="w-full p-3 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Đặng Trịnh Duy Anh"
              />
            </div>

            {/* Date Selection */}
            <div className="relative">
              <label className="text-sm text-gray-600">Năm Sinh</label>
              <div>
                <DatePicker
                  value={selectedDate}
                  format="DD-MM-YYYY"
                  onChange={onChangeDateTime}
                />
              </div>
            </div>
            {/* Gender Selection */}
            <div className="flex space-x-6">
              {["Nam", "Nữ"].map((item) => (
                <label key={item} className="flex items-center space-x-2">
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

            {/* Phone Input */}
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm text-gray-600">Số điện thoại</label>
                <input
                  type="tel"
                  className="w-full p-3 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="số điện thoại"
                />
              </div>
            </div>

            {/* Height Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm">Chiều cao</label>
                <span className="text-sm">{height}cm</span>
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
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm">Cân nặng</label>
                <span className="text-sm">{weight}kg</span>
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
            <div className="flex justify-between items-center gap-4">
              <Form.Item label="Thành phố">
                <Select value={city} onChange={handleOnChangeProvine}>
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
              </Form.Item>

              <Form.Item label="Phường/Xã">
                <Select
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
              </Form.Item>
            </div>

            <div>
              <div className="max-w-md mx-auto p-4">
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Tải lên hình ảnh
                  </h2>
                  <p className="text-sm text-gray-500">
                    Chọn hoặc kéo thả hình ảnh
                  </p>
                </div>

                <div
                  className={`relative border-2 rounded-xl p-4 text-center ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-gray-50"
                  } transition-all duration-200 ease-in-out`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!previewUrl ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        {/* Image Plus Icon */}
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
                          <span className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md">
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
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg shadow-lg"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                      >
                        {/* X Icon */}
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
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          {/* Upload Icon */}
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
                      <button
                        className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
                        onClick={() =>
                          console.log("Upload image:", selectedImage)
                        }
                      >
                        Tải lên
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "Cập nhật mật khẩu",
      children: <PersonalInfoForm id={id} />, // Replace with actual content
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
    <div className="w-full  bg-[#d9d9d9] relative main_profile ">
      <div className="info-name">
        <div className="flex justify-between  ">
          <div className="w-2/3">
            <h1 className="text-2xl text-[#231f20]">HI, {name}</h1>
            {/* <img className="icon_users mt-3" src={logo_user} alt="logo user" />
             */}
            {points >= bachkim ? (
              <img
                src={palatium}
                alt="lên hạng"
                className="icon_users mt-4 w-52"
                style={{ height: "50px" }}
              />
            ) : points >= vang ? (
              <img
                src={gold}
                alt="lên hạng"
                className="w-32"
                style={{ height: "50px" }}
              />
            ) : points >= bac ? (
              <img
                src={silver} // Use a placeholder for the lowest rank
                alt="lên hạng"
                className="w-32 mt-4"
                style={{ height: "50px" }}
              />
            ) : (
              <img
                src={logo_user} // Use a placeholder for the lowest rank
                alt="lên hạng"
                className="w-32 mt-4"
                style={{ height: "50px" }}
              />
            )}
            <div className="flex items-center gap-2 mt-5">
              <p className="account-line__description flex items-center gap-1">
                Chi tiêu thêm
                <b className="text-blue-500 font-bold">
                  {points >= bachkim
                    ? formatPrice(0)
                    : points >= vang
                    ? `${formatPrice(bachkim - points)}`
                    : points >= bac
                    ? `${formatPrice(vang - points)}`
                    : points <= bac
                    ? `${formatPrice(bac - points)}`
                    : `${0}`}

                  {/* Initial progress to the first rank */}
                </b>
                <span>để lên hạng</span>
                <b className="text--outline font-bold">
                  <div className="mt-1">
                    {points >= bachkim ? (
                      <img
                        src={palatium}
                        alt="lên hạng"
                        className="w-16"
                        style={{ height: "26px" }}
                      />
                    ) : points >= vang ? (
                      <img
                        src={palatium}
                        alt="lên hạng"
                        className="w-16"
                        style={{ height: "26px" }}
                      />
                    ) : points >= bac ? (
                      <img
                        src={gold}
                        alt="lên hạng"
                        className="w-16"
                        style={{ height: "26px" }}
                      />
                    ) : (
                      <img
                        src={silver}
                        alt="lên hạng"
                        className="w-16"
                        style={{ height: "26px" }}
                      />
                    )}
                  </div>
                </b>
              </p>
              ;
            </div>
            <div className="mt-2">
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
                  src={logo_user}
                  className="h-auto w-16 object-cover"
                  style={{ height: "26px" }}
                />
              </span>
              <span className="account-line__text account-line_hangbac absolute ">
                <img
                  src={silver}
                  className="h-auto w-16 object-cover"
                  style={{ height: "26px" }}
                />
              </span>
              <span className="account-line__text account-line_hangvang absolute ">
                <img
                  src={gold}
                  className=" object-cover "
                  style={{ width: "72px", height: "26px" }}
                />
              </span>
              <span className="account-line__text account-line_hangbachkim absolute  ">
                <img
                  src={palatium}
                  className=" object-cover palatium "
                  style={{ width: "202px", height: "26px" }}
                />
              </span>
            </div>
          </div>
          <div className="">
            <p className="text-xl text-[#00000099]">Tổng chi tiêu </p>
            <p className="text-center text-2xl font-bold text-[#000000]">
              {formatPrice(points || 0)}
            </p>
          </div>
        </div>
      </div>
      <div className="profile_username relative bottom-0 flex justify-between gap-10">
        <div className="w-2/6 account_list_btn">
          <p className="flex items-center p-1 bg-white w-full rounded-md">
            <img src={img5} className="h-auto w-9 object-cover" />
            <span className="text-[#333] ml-2 font-bold text-xl">
              Thông tin tài khoản
            </span>
          </p>
          <p className="flex items-center p-1 bg-white  w-full rounded-md">
            <img src={img4} className="h-auto w-9 object-cover" />
            <span className="text-[#333] ml-2 font-bold text-xl">
              Lịch Sử đơn hàng
            </span>
          </p>
          <p className="flex items-center p-1 bg-white  w-full rounded-md">
            <img src={img1} className="h-auto w-9 object-cover" />
            <span className="text-[#333] ml-2 font-bold text-xl">
              Lịch sử mua sắm
            </span>
          </p>
          <p className="flex items-center p-1 bg-white  w-full rounded-md">
            <img src={img2} className="h-auto w-9 object-cover" />
            <span className="text-[#333] ml-2 font-bold text-xl">
              Đánh giá phản hổi
            </span>
          </p>
          <p className="flex items-center p-1 bg-white  w-full rounded-md">
            <img src={img1} className="h-auto w-9 object-cover" />
            <span className="text-[#333] ml-2 font-bold text-xl">
              Lịch sử mua sắm
            </span>
          </p>
          <p className="flex items-center p-1 bg-white  w-full rounded-md">
            <img src={img2} className="h-auto w-9 object-cover" />
            <span className="text-[#333] ml-2 font-bold text-xl">
              Đánh giá phản hổi
            </span>
          </p>
          <p className="flex items-center p-1 bg-white  w-full rounded-md">
            <img src={img3} className="h-auto w-9 object-cover" />
            <span className="text-[#333] ml-2 font-bold text-xl">
              Đăng xuất
            </span>
          </p>
        </div>

        <div className="w-2/3 bg-white rounded-md p-7 flex justify-around gap-5">
          <div className="account-image w-60">
            <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>
            <img src={image} alt="avtart" className="w-48 h-48 object-cover" />
          </div>
          <div className="w-3/4 ">
            <div className="account-profile_check">
              <div className="mt-6 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Họ Và Tên</span>
                <span className="text-gray-950 font-bold">{name}</span>
              </div>

              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Số điện thoại</span>
                <span className="text-gray-950 font-bold">{phone}</span>
              </div>

              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Giới tính</span>
                <span className="text-gray-950 font-bold">{gender}</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">
                  Ngày sinh<span className="text-xs">(ngày/tháng/năm)</span>
                </span>
                <span className="text-gray-950 font-bold">{formattedDate}</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Chiều cao</span>
                <span className="text-gray-950 font-bold">{height}cm</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Cân nặng</span>
                <span className="text-gray-950 font-bold">{weight}kg</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">
                  Tỉnh/Thành Phố
                </span>
                <span className="text-gray-950 font-bold">{city}</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Quận/Huyện</span>
                <span className="text-gray-950 font-bold">{district}</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Phường/Xã</span>
                <span className="text-gray-950 font-bold">{ward}</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Email</span>
                <span className="text-gray-950 font-bold">{email}</span>
              </div>
              <div className="mt-4 flex justify-between gap-3 ">
                <span className="text-gray-600 font-medium">Mật khẩu</span>
                <span className="text-gray-950 font-bold">
                  *******************
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-3 ">
                <Button onClick={() => setOpenResponsive(true)}>
                  Cập Nhật
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/6">
        <Modal
          title="Thông tin tài khoản"
          centered
          open={openResponsive}
          onCancel={() => setOpenResponsive(false)}
          footer={
            <Button onClick={() => handleUpdateProfileUser()}>Cập Nhật</Button>
          }
          width={{
            with: "1000px",
            sm: "80%",
            md: "70%",
            lg: "60%",
            xl: "50%",
            xxl: "40%",
          }}
        >
          <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
