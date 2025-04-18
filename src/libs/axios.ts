import axios from "axios";

const axiosInstance = axios.create({
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
});

export { axiosInstance };
