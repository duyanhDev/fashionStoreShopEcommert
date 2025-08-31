import { FILTER_TYPES } from "../actions/type";

const initialState = {
  currentPage: 1,
  sortPrice: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sortName: "",
  sortDate: "",
  selectedSize: [],
  selectedColor: "",
  priceRange: 0,
  products: [],
  data: [],
  care: "",
  setsize: "",
  color: "",
  view: "",
  brand: "",
  totalPages: 1,
  loading: false,
};

export const filterReducer = (state = initialState, action) => {
  switch (action.type) {
    case FILTER_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case FILTER_TYPES.SET_PAGE:
      return {
        ...state,
        currentPage: action.payload,
      };

    case FILTER_TYPES.SET_SORT_PRICE:
      return {
        ...state,
        sortPrice: action.payload,
        currentPage: 1,
      };
    case FILTER_TYPES.SET_DATE:
      return {
        ...state,
        sortDate: action.payload,
        currentPage: 1,
      };

    case FILTER_TYPES.SET_HOT:
      return {
        ...state,
        sortSold: action.payload,
        currentPage: 1,
      };
    case FILTER_TYPES.SET_VIEW:
      return {
        ...state,
        view: action.payload,
        currentPage: 1,
      };
    case FILTER_TYPES.SET_BRAND:
      return {
        ...state,
        brand: action.payload,
        currentPage: 1,
      };
    case FILTER_TYPES.SET_CATEGORY:
      return {
        ...state,
        category: action.payload,
        currentPage: 1,
      };
    case FILTER_TYPES.SET_CATEGORY:
      return {
        ...state,
        care: action.payload,
        currentPage: 1,
      };

    case FILTER_TYPES.SET_PRICE_RANGE:
      return {
        ...state,
        priceRange: action.payload,
        minPrice: action.payload,
        maxPrice: action.payload,
        currentPage: 1,
      };

    case FILTER_TYPES.SET_SIZE:
      return {
        ...state,
        selectedSize: state.selectedSize.includes(action.payload)
          ? state.selectedSize.filter((size) => size !== action.payload)
          : [...state.selectedSize, action.payload],
        currentPage: 1,
      };

    case FILTER_TYPES.SET_COLOR:
      return {
        ...state,
        selectedColor: action.payload,
        currentPage: 1,
      };

    case FILTER_TYPES.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
      };

    case FILTER_TYPES.SET_TOTAL_PAGES:
      return {
        ...state,
        totalPages: action.payload,
      };

    case FILTER_TYPES.RESET_FILTERS:
      return {
        ...initialState,
        products: state.products,
        totalPages: state.totalPages,
      };

    default:
      return state;
  }
};
