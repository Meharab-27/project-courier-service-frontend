import { ofetch } from "ofetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  async onResponseError({ response }) {
    const errorData = response._data;
    const message =
      errorData?.message ||
      errorData?.error ||
      errorData?.errorMessages?.[0]?.message ||
      response.statusText ||
      "Something went wrong";
    throw new Error(message);
  },
});

export default apiClient;
