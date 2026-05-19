import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyDd2QPl_I_U9uOWiqSTOGarMofxxFb1UwU",
  authDomain:        "homstay-admin.firebaseapp.com",
  projectId:         "homstay-admin",
  storageBucket:     "homstay-admin.firebasestorage.app",
  messagingSenderId: "235029256168",
  appId:             "1:235029256168:web:600e68033963c6e1e9765d",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
