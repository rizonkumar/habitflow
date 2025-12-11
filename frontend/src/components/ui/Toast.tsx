"use client";

import { toast, ToastContainer as ReactToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "info" | "success" | "error";

type ToastPayload = {
  message: string;
  type?: ToastType;
};

export const useToastStore = {
  getState: () => ({
    push: (payload: ToastPayload) => {
      const { message, type = "info" } = payload;
      switch (type) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        default:
          toast.info(message);
      }
    },
  }),
};

export const ToastContainer = () => {
  return (
    <ReactToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      transition={Bounce}
    />
  );
};
