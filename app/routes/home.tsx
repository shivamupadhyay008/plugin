import type { Route } from "./+types/home";
import { PrayerAI } from "../components/PrayerAI";
import { useEffect } from "react";
import { setAuthToken, setPluginSecretKey } from "~/services/axiosInstance";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ark AI" },
    { name: "description", content: "Welcome to Ark AI!" },
  ];
}

export default function Home() {
  const handleMessage = (event) => {
    console.log("event.data", event.data);
    console.log("event.origin", event.origin);

    // Check if message contains expected authentication data
    if (event.data && event.data.pluginSecretKey) {
      console.log("Setting pluginSecretKey:", event.data.pluginSecretKey);
      setPluginSecretKey(event.data.pluginSecretKey);

      if (event.data.authToken) {
        console.log("Setting authToken:", event.data.authToken);
        setAuthToken(event.data.authToken);
      }

      // Signal back to parent that credentials were received
      window.parent.postMessage({ type: "CHILD_READY" }, event.origin);
    } else if (event.data?.type === "PARENT_ACK") {
      console.log("Parent acknowledged — communication established");
    } else {
      console.log("No pluginSecretKey in event.data");
    }
  };
  // console.log('some')
  
  useEffect(() => {
    console.log("Adding message listener for parent app communication");
    // document.body.innerHTML += '<pre>' + 'testung ' + '</pre>';

    window.addEventListener("message", handleMessage);
    window?.ReactNativeWebView?.postMessage("Hello from Web!");


    // Signal to parent that child is ready to receive data
    // Check if we're in an iframe before posting
    if (window !== window.parent) {
      window.parent.postMessage({ type: "CHILD_READY" }, "*");
    }

    return () => {
      console.log("Removing message listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  return (
    <main className="min-h-screen bg-white">
      <h3 className="text-4xl font-bold text-gray-800 text-center py-8 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
        Spiritual AI
      </h3>
      <PrayerAI />
    </main>
  );
}
