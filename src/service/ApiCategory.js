import axios from "./../untils/axios";

const ListCategoryAPI = async () => {
  return await axios.get("api/v1/category");
};

const AddCategoryAPI = async (name, description) => {
  return await axios.post("api/v1/category", {
    name,
    description,
  });
};

const ListOneCategoryAPI = async (id) => {
  return await axios.get(`api/v1/category/${id}`);
};

const UpdateOneCatogryAPI = async (id, name, description) => {
  return await axios.put(`api/v1/category/${id}`, {
    name,
    description,
  });
};

const DeleteOneCategoryAPI = async (id) => {
  return await axios.delete(`api/v1/category/${id}`);
};
const CategoryProductsGender = async (
  gender,
  category,
  minPrice,
  maxPrice,
  sortName,
  sortPrice,
  sortDate,
  sortSold,
  care,
  size,
  color,
  page
) => {
  return axios.get(`api/v1/categoryProductsFilter`, {
    params: {
      gender,
      category,
      minPrice,
      maxPrice,
      sortName,
      sortPrice,
      sortDate,
      sortSold,
      care,
      size,
      color,
      page,
    },
  });
};

const CategoryGenderFitterAPI = async (gender, category, page) => {
  return axios.get(`api/v1/categoryfilter/${gender}/${category}/${page}`);
};
export {
  ListCategoryAPI,
  AddCategoryAPI,
  ListOneCategoryAPI,
  UpdateOneCatogryAPI,
  DeleteOneCategoryAPI,
  CategoryProductsGender,
  CategoryGenderFitterAPI,
};
