import axios from "./../untils/axios";

const FindAllSupplierAPI = async () => {
  try {
    return await axios.get("api/v1/supplier");
  } catch (error) {
    console.log(error);
  }
};

const findOneSupplierAPI = async (id) => {
  return await axios.get(`api/v1/supplier-one/${id}`);
};

const CreateSupplierAPI = async (data) => {
  const token = localStorage.getItem("token");
  return await axios.post(
    "api/v1/create-supplier",
    {
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      website: data.website,
      taxCode: data.taxCode,
      notes: data.notes,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const updateSupplierAPI = async (id, data) => {
  const token = localStorage.getItem("token");
  return await axios.put(
    "api/v1/update-supplier",
    {
      id: id,
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      website: data.website,
      taxCode: data.taxCode,
      notes: data.notes,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const deleteSupplierAPI = async (id) => {
  const token = localStorage.getItem("token");

  return await axios.delete(`api/v1/delete-supplier`, {
    params: { id },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export {
  FindAllSupplierAPI,
  findOneSupplierAPI,
  CreateSupplierAPI,
  updateSupplierAPI,
  deleteSupplierAPI,
};
