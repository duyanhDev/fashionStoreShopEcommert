// routes.js
import BotChatAI from "../ChatAI/BotChat";
import Create from "../components/AddProducts/Create";
import Admin from "../components/Admin/Admin";
import Blog from "../components/Blog/Blog";
import CartProducts from "../components/CartProducts/CartProducts";
import Category from "../components/Category/Category";
import ClothingMale from "../components/ClothingMale/ClothingMale";
import Details from "../components/Details/Details";
import EditCustom from "../components/EditCustom/EditCustom";
import ForgetPassword from "../components/ForgetPassword/ForgetPassword";
import Home from "../components/Home/Home";
import DeliveryMap from "../components/Map/Map";

import OrderAdmin from "../components/OderAdmin/OrderAdmin";
import OderStatus from "../components/OderStatus/OderStatus";
import Order from "../components/Orders/Order";
import Products from "../components/Products/Product";
import Profile from "../components/ProfileUsers/Profile";
import Ranking from "../components/Ranking/Ranking";
import ViewSearch from "../components/Sumsearch/ViewSearch";
import ChatSp from "../components/SupportChat/ChatSp";
import UpLoad from "../components/UpLoadProducts/UpLoad";
import UserStatsCard from "../components/UserChar/UserChart";
import UsersCustom from "../components/Users/Usercustom";
import VNpay from "../components/VNpay/VNpay";
import Voucher from "../components/Voucher/Voucher";
import View from "../components/ViewProducts/View";
import FavoritesList from "../components/FavoritesList/FavoritesList";
import ProductReviewAdmin from "../components/ProductReviewAdmin/ProductReviewAdmin";
import LoginForm from "../components/Login/Login";
import RegisterForm from "../components/Register/Register";
import GeminiBlogGenerator from "../components/GeminiBlogGenerator/GeminiBlogGenerator";
import AdminPostCreator from "../components/AdminPostCreator/AdminPostCreator";
import AccountAdmin from "../components/AccountAdmin/AccountAdmin";
import AddVoucher from "../components/AddVoucher/AddVoucher";
import ManageStore from "../components/ManageStore/ManageStore";
import PermissionRoute from "../PermissionRoute/PermissionRoute ";
import AdminAccountManagement from "../components/AdminAccountManagement/AdminAccountManagement";
import Banner from "../components/Banner/Banner";
import CreateBannerForm from "../components/Banner/CreateBannerForm/CreateBannerForm";
import UpdateBannerForm from "../components/Banner/UpdateBannerForm/UpdateBannerForm";

export const RouterLayout = [
  {
    path: "/",
    element: <Home />,
    index: true,
  },
  {
    path: "/product/:slug",
    element: <Details />,
  },
  {
    path: "/cart",
    element: <CartProducts />,
  },
  {
    path: "/vnpay_return",
    element: <VNpay />,
  },
  {
    path: "/order",
    element: <Order />,
  },
  {
    path: "/map",
    element: <DeliveryMap />,
  },
  {
    path: "/orderstatus/:id",
    element: <OderStatus />,
  },
  {
    path: "/ChatAI",
    element: <BotChatAI />,
  },
  {
    path: "/clothing/:gender",
    element: <ClothingMale />,
  },
  {
    path: "/search",
    element: <ViewSearch />,
  },
  {
    path: "/ranking",
    element: <Ranking />,
  },
  {
    path: "/profile/:username",
    element: <Profile />,
  },
  {
    path: "/blog",
    element: <Blog />,
  },
  {
    path: "/wishlist",
    element: <FavoritesList />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/Register",
    element: <RegisterForm />,
  },
  {
    path: "/create/blog",
    element: <AdminPostCreator />,
  },
];

export const RouterAdmin = [
  {
    path: "admin",
    element: <Admin />,
    children: [
      {
        index: true,
        element: <UserStatsCard />,
      },
      {
        path: "banner",
        element: <Banner />,
      },
      {
        path: "add-banner",
        element: <CreateBannerForm />,
      },
      {
        path: "banner",
        element: <Banner />,
      },
      {
        path: "update-banner/:id",
        element: <UpdateBannerForm />,
      },
      {
        path: "products",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <Products />
          </PermissionRoute>
        ),
      },
      {
        path: "adminAccountManagement",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <AdminAccountManagement />
          </PermissionRoute>
        ),
      },
      {
        path: "addproduct",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <Create />
          </PermissionRoute>
        ),
      },
      {
        path: "category",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <Category />
          </PermissionRoute>
        ),
      },
      {
        path: "uploadproducts/:id",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <UpLoad />
          </PermissionRoute>
        ),
      },
      {
        path: "viewproduct/:id",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <View />
          </PermissionRoute>
        ),
      },
      {
        path: "order",
        element: (
          <PermissionRoute
            allowedPermissions={["admin", "staff", "order_approval"]}
          >
            <OrderAdmin />
          </PermissionRoute>
        ),
      },
      {
        path: "support-chat",
        element: (
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
            <ChatSp />
          </PermissionRoute>
        ),
      },
      {
        path: "voucher",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <Voucher />
          </PermissionRoute>
        ),
      },
      {
        path: "usercustom",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <UsersCustom />
          </PermissionRoute>
        ),
      },
      {
        path: "account",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <AccountAdmin />
          </PermissionRoute>
        ),
      },
      {
        path: "usercustom/:id",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <EditCustom />
          </PermissionRoute>
        ),
      },
      {
        path: "review",
        element: (
          <PermissionRoute allowedPermissions={["admin", "review", "support"]}>
            <ProductReviewAdmin />
          </PermissionRoute>
        ),
      },
      {
        path: "add-voucher",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <AddVoucher />
          </PermissionRoute>
        ),
      },
      {
        path: "manage-store",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <ManageStore />
          </PermissionRoute>
        ),
      },
    ],
  },
];
