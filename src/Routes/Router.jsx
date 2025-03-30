// routes.js
import BotChatAI from "../ChatAI/BotChat";
import Create from "../components/AddProducts/Create";
import Admin from "../components/Admin/Admin";
import Blog from "../components/Blog/Blog";
import CartProducts from "../components/CartProducts/CartProducts";
import Category from "../components/Category/Category";
import ClothingMale from "../components/ClothingMale/ClothingMale";
import Details from "../components/Details/Details";
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
import VNpay from "../components/VNpay/VNpay";
import Voucher from "../components/Voucher/Voucher";
import View from "../components/VỉewProducts/View";

export const RouterLayout = [
  {
    path: "/",
    element: <Home />,
    index: true,
  },
  {
    path: "/product/:id",
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
    path: "/category/:gender",
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
];

export const RouterAdmin = [
  {
    path: "admin",
    element: <Admin />,
    children: [
      { index: true, element: <UserStatsCard /> },
      { path: "products", element: <Products /> },
      { path: "addproduct", element: <Create /> },
      { path: "category", element: <Category /> },
      { path: "uploadproducts/:id", element: <UpLoad /> },
      { path: "viewproduct/:id", element: <View /> },
      { path: "order", element: <OrderAdmin /> },
      { path: "support-chat", element: <ChatSp /> },
      { path: "voucher", element: <Voucher /> },
    ],
  },
];
