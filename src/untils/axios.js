import axios from "axios";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
});

const instance = axios.create({
  baseURL: "http://localhost:9000/",
});

// const instance = axios.create({
//   baseURL: "https://fashionstoreshop.onrender.com/",
// });

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    NProgress.start();
    return config;
  },
  function (error) {
    // Do something with request error
    NProgress.done();
    console.error(error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Do something with response data
    NProgress.done();
    return response;
  },
  function (error) {
    // Do something with response error
    NProgress.done();
    console.error(error);
    return Promise.reject(error);
  }
);

export default instance;
