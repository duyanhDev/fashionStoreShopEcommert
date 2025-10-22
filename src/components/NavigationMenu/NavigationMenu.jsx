import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiChevronDown } from "react-icons/hi";
import { Drawer, Collapse } from "antd";

const { Panel } = Collapse;

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      id: "products",
      label: "Sản phẩm",
      link: "/clothing/unisex",
      hasDropdown: true,
      categories: [
        {
          title: "Áo",
          items: [
            "Tất cả các loại áo",
            "Áo sơ mi",
            "Áo thun",
            "Áo polo",
            "Áo khoác",
          ],
        },
        {
          title: "Quần",
          items: [
            "Tất cả các loại quần",
            "Quần jeans",
            "Quần short",
            "Quần dài",
            "Quần thể thao",
          ],
        },
        {
          title: "Giày",
          items: [
            "Tất cả các loại giày",
            "Giày sneaker",
            "Giày thể thao",
            "Giày sandal",
            "Giày boot",
          ],
        },
        {
          title: "Túi",
          items: [
            "Tất cả các loại túi",
            "Túi xách",
            "Túi đeo chéo",
            "Ba lô",
            "Ví",
          ],
        },
      ],
      images: [
        "https://dosi-in.com/file/detailed/468/dosiin-dkmv-dkmv-ao-thun-nu-phong-rong-in-hinh-mau-trang-ao-thun-nu-white-surfing-tee-dkmv-46824468245.jpg?w=320&h=320&fit=fill&fm=webp",
        "https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-cotton-nu-don-t-kill-my-vibe-mau-trang-vibration-468312468312.jpg?w=670&h=670&fit=fill&fm=webp",
        "https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-unisex-form-rong-nu-mau-trang-dontkill-my-vibe-dkmv-always-smile-tee-white-4468344.jpg?w=670&h=670&fit=fill&fm=webp",
      ],
    },
    {
      id: "male",
      label: "Nam",
      link: "/clothing/male",
      hasDropdown: true,
      categories: [
        {
          title: "Áo khoác",
          items: [
            "Tất cả áo khoác",
            "Áo khoác da",
            "Áo khoác bomber",
            "Áo khoác Denim",
            "Áo khoác Varsity",
            "Áo khoác Jacket",
          ],
        },
        {
          title: "Áo thun",
          items: ["Áo thun không tay", "Áo thun tay dài", "Áo thun tay ngắn"],
        },
        {
          title: "Áo sơ mi",
          items: ["Áo sơ mi tay ngắn", "Áo sơ mi tay dài"],
        },
        {
          title: "Quần",
          items: ["Quần jean", "Quần ngắn", "Quần dài", "Quần jogger"],
        },
        {
          title: "Giày",
          items: ["Giày sneaker", "Giày thể thao", "Giày cao cổ", "Giày tây"],
        },
      ],
      images: [
        "https://dosi-in.com/file/detailed/468/dosiin-dkmv-dkmv-ao-thun-nu-phong-rong-in-hinh-mau-trang-ao-thun-nu-white-surfing-tee-dkmv-46824468245.jpg?w=320&h=320&fit=fill&fm=webp",
        "https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-cotton-nu-don-t-kill-my-vibe-mau-trang-vibration-468312468312.jpg?w=670&h=670&fit=fill&fm=webp",
        "https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-unisex-form-rong-nu-mau-trang-dontkill-my-vibe-dkmv-always-smile-tee-white-4468344.jpg?w=670&h=670&fit=fill&fm=webp",
      ],
    },
    { id: "female", label: "Nữ", link: "/clothing/female" },
    {
      id: "accessories",
      label: "Phụ kiện",
      link: "/clothing/unisex?Category=Phụ+Kiện&currentPage=1",
    },
    { id: "about", label: "Thương hiệu", link: "/about" },
    { id: "ranking", label: "Xếp hạng", link: "/ranking" },
    { id: "blog", label: "Blog", link: "/blog" },
  ];

  return (
    <div className="nav_menu">
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex justify-center items-center">
        <ul className="flex gap-8 xl:gap-10 items-center">
          {menuItems.map((item) => (
            <div key={item.id} className="relative group">
              <Link
                to={item.link}
                className="flex items-center gap-1 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              >
                {item.label}
                {item.hasDropdown && <HiChevronDown className="text-sm" />}
              </Link>

              {/* Desktop Dropdown */}
              {item.hasDropdown && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full translate-y-3 group-hover:translate-y-0
               transition-all duration-300 ease-out
               w-screen max-w-6xl
               opacity-0 invisible group-hover:opacity-100 group-hover:visible z-[9999]"
                >
                  <div
                    className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]
                 rounded-2xl overflow-hidden border border-gray-100
                 w-full mx-auto"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Categories Section */}
                      <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {item.categories.map((category, idx) => (
                            <div key={idx}>
                              <h3
                                className="text-base font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-500 
                             cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() =>
                                  category.title === "Áo" &&
                                  navigate("/unisex?currentPage=1&Category=Áo")
                                }
                              >
                                {category.title}
                              </h3>
                              <ul className="space-y-2">
                                {category.items.map((subItem, subIdx) => (
                                  <li key={subIdx}>
                                    <Link
                                      to="#"
                                      className="text-sm text-gray-600 hover:text-blue-600 hover:translate-x-1 
                                   transition-all duration-200 block"
                                    >
                                      {subItem}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Images Section */}
                      <div className="w-full lg:w-80 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            {item.images?.slice(0, 2).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt="Product"
                                className="w-full h-32 object-cover rounded-xl hover:scale-105 
                             transition-transform duration-300 shadow-md"
                              />
                            ))}
                          </div>
                          <div>
                            <img
                              src={item.images?.[2]}
                              alt="Product"
                              className="w-full h-full object-cover rounded-xl hover:scale-105 
                           transition-transform duration-300 shadow-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
          aria-label="Toggle menu"
        >
          <HiMenu size={28} />
        </button>

        {/* Ant Design Drawer */}
        <Drawer
          title={
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Menu
            </div>
          }
          placement="right"
          onClose={toggleMenu}
          open={isOpen}
          width={window.innerWidth < 640 ? "85%" : 400}
          styles={{
            header: {
              background:
                "linear-gradient(to right, rgb(239 246 255), rgb(250 245 255))",
              borderBottom: "1px solid rgb(229 231 235)",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
            },
            body: {
              padding: "16px",
            },
          }}
          zIndex={9999}
        >
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <Collapse
                    ghost
                    expandIconPosition="end"
                    className="bg-transparent"
                    items={[
                      {
                        key: item.id,
                        label: (
                          <span className="font-semibold text-base text-gray-700">
                            {item.label}
                          </span>
                        ),
                        children: (
                          <div className="space-y-3">
                            {item.categories.map((category, idx) => (
                              <div
                                key={idx}
                                className="pb-3 border-b border-gray-200 last:border-0"
                              >
                                <h4 className="text-sm font-bold text-gray-900 mb-2 px-3 py-2 bg-blue-50 rounded-lg">
                                  {category.title}
                                </h4>
                                <ul className="space-y-1">
                                  {category.items.map((subItem, subIdx) => (
                                    <li key={subIdx}>
                                      <Link
                                        to="#"
                                        onClick={toggleMenu}
                                        className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 block py-2 px-3 rounded-lg transition-all"
                                      >
                                        {subItem}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <Link
                    to={item.link}
                    onClick={toggleMenu}
                    className="block p-4 text-gray-700 hover:bg-blue-50 rounded-lg font-semibold text-base transition-colors border-b border-gray-100"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default NavigationMenu;
