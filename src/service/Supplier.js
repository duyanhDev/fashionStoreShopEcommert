import axios from "./../untils/axios";

const FindAllSupplierAPI = async () => {
  try {
    return await axios.get("api/v1/supplier");
  } catch (error) {
    console.log(error);
  }
};

export { FindAllSupplierAPI };
