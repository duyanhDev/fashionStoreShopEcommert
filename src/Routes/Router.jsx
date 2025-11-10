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

import Voucher from "../components/Voucher/Voucher";
import View from "../components/ViewProducts/View";
import FavoritesList from "../components/FavoritesList/FavoritesList";
import ProductReviewAdmin from "../components/ProductReviewAdmin/ProductReviewAdmin";
import LoginForm from "../components/Login/Login";
import RegisterForm from "../components/Register/Register";
import AdminPostCreator from "../components/AdminPostCreator/AdminPostCreator";
import AccountAdmin from "../components/AccountAdmin/AccountAdmin";
import AddVoucher from "../components/AddVoucher/AddVoucher";
import ManageStore from "../components/ManageStore/ManageStore";
import PermissionRoute from "../PermissionRoute/PermissionRoute ";
import AdminAccountManagement from "../components/AdminAccountManagement/AdminAccountManagement";
import Banner from "../components/Banner/Banner";
import CreateBannerForm from "../components/Banner/CreateBannerForm/CreateBannerForm";
import UpdateBannerForm from "../components/Banner/UpdateBannerForm/UpdateBannerForm";
import Transactions from "../components/Transactions/Transactions";
import BlogPostPage from "../components/BlogPostPage/BlogPostPage";
import BrandAboutPage from "../components/BrandAboutPage/BrandAboutPage";
import UserVoucherWallet from "../components/UserVoucherWallet/UserVoucherWallet";
import ResetPasswordForm from "../components/ResetPasswordForm/ResetPasswordForm";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import PaymentSuccessPage from "../components/PaymentSuccessPage/PaymentSuccessPage";
import ViewBannerForm from "../components/Banner/ViewBanner/ViewBannerForm";
import ChangelogPage from "../components/ChangelogPage/ChangelogPage";
import ChangelogManager from "../components/ChangelogManager/ChangelogManager";
import BlogManager from "../components/BlogManager/BlogManager";
import SizeManager from "../components/SizeManager/SizeMange";
import PantsSizeManager from "../components/PantsSizeManager/PantsSizeManager";
import PrivacyTermsPage from "../components/PrivacyTermsPage/PrivacyTermsPage";
import ColorAdmin from "../components/ColorAdmin/ColorAdmin";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";

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
    path: "/vnpay_return/:id",
    element: <PaymentSuccessPage />,
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
    path: "/blog/:slug",
    element: <BlogPostPage />,
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
  {
    path: "/about",
    element: <BrandAboutPage />,
  },
  {
    path: "/changelog",
    element: <ChangelogPage />,
  },
  {
    path: "/dieu-khoan-va-chinh-sach-bao-mat-thong-tin-ca-nhan",
    element: <PrivacyTermsPage />,
  },
  {
    path: "/voucher-wallet",
    element: (
      <PrivateRoute>
        <UserVoucherWallet />
      </PrivateRoute>
    ),
  },
  {
    path: "/reset-password",
    element: <ResetPasswordForm />,
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
        path: "add-banner",
        element: (
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
            <CreateBannerForm />
          </PermissionRoute>
        ),
      },
      {
        path: "banner/:id",
        element: (
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
            <ViewBannerForm />
          </PermissionRoute>
        ),
      },
      {
        path: "banner",
        element: (
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
            <Banner />
          </PermissionRoute>
        ),
      },
      {
        path: "update-banner/:id",
        element: (
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
            <UpdateBannerForm />
          </PermissionRoute>
        ),
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
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
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
        path: "du-doan",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <AdminDashboard />
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
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
            <ProductReviewAdmin />
          </PermissionRoute>
        ),
      },
      {
        path: "add-voucher",
        element: (
          <PermissionRoute
            allowedPermissions={["admin", "staff", "customer_support"]}
          >
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

      {
        path: "revenue",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <Transactions />
          </PermissionRoute>
        ),
      },
      {
        path: "changle-log",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <ChangelogManager />
          </PermissionRoute>
        ),
      },
      {
        path: "quan-li-blog",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <BlogManager />
          </PermissionRoute>
        ),
      },
      {
        path: "quan-li-bang-size-ao",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <SizeManager />
          </PermissionRoute>
        ),
      },
      {
        path: "quan-li-bang-size-quan",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <PantsSizeManager />
          </PermissionRoute>
        ),
      },
      {
        path: "color",
        element: (
          <PermissionRoute allowedPermissions={["admin"]}>
            <ColorAdmin />
          </PermissionRoute>
        ),
      },
    ],
  },
];
