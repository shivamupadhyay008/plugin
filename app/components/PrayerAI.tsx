import React from "react";
import { ResponseContainer } from "./ResponseContainer";
import { getPromiseAndPrayerFromAI, type PromiseItem } from "../services/promise";

const PRAYER_AI_TABS = {
  Promise: "arkai_promise",
  Prayer: "arkai_prayer"
};

interface PrayerAIProps {}

export function PrayerAI({state}: PrayerAIProps) {
  // Initialize with empty data - will show loading/placeholder until API response
  const [activeTab, setActiveTab] = React.useState(PRAYER_AI_TABS.Promise);
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<{ promise: string[], prayer: string }>({
    promise: [],
    prayer: ""
  });
  const [apiData, setApiData] = React.useState<{ promise: PromiseItem[], prayer: string }>({
    promise: [],
    prayer: ""
  });
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isReloading, setIsReloading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const onTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const getData = async (isRefreshing = false) => {
    if (isRefreshing && (!query || query.trim() === "")) {
      // setData({ promise: [], prayer: "" });
      setLoading(false);
      setRefreshing(false);
      setIsReloading(false);
      setErrorMessage("");
      return;
    }

    if (!query || query.trim() === "") {
      setLoading(false);
      setRefreshing(false);
      setIsReloading(false);
      setErrorMessage("");
      return;
    }

    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      // Use real API call
      const response = await getPromiseAndPrayerFromAI({ query });
      console.log("API response:", response);

      setErrorMessage("");
      setApiData({
        promise: response.data.result.promise,
        prayer: response.data.result.prayer,
      });
      setData({
        promise: response.data.result?.promise.map(p => p.verse),
        prayer: response.data.result.prayer,
      });
    } catch (err) {
      console.error("Failed to fetch prayer AI data", err);
      setErrorMessage("Failed to load content. Please try again.");
      // Fallback to mock data on error
      setData({
        promise: activeTab === PRAYER_AI_TABS.Promise ? mockData.promise : mockData.promise,
        prayer: activeTab === PRAYER_AI_TABS.Prayer ? mockData.prayer : mockData.prayer,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsReloading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setIsReloading(true);
    getData(true);
  };

  const handleSearch = async () => {
    console.log("Search button clicked with query:", query);
    if (query.trim()) {
      await getData(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask about faith, guidance, or prayer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {state&&
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors cursor-pointer"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onTabChange(PRAYER_AI_TABS.Promise)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === PRAYER_AI_TABS.Promise
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500"
              }`}
            >
              Promises
            </button>
            <button
              onClick={() => onTabChange(PRAYER_AI_TABS.Prayer)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === PRAYER_AI_TABS.Prayer
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500"
              }`}
            >
              Prayer
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && !refreshing ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="px-4 pb-4">
            {errorMessage ? (
              <div className="text-center py-8">
                <p className="text-red-600">{errorMessage}</p>
              </div>
            ) : data.promise.length > 0 || data.prayer ? (
              <div className="space-y-4">
                {activeTab === PRAYER_AI_TABS.Promise && (
                  <ResponseContainer type={activeTab} response={apiData.promise.length > 0 ? apiData.promise : data.promise.map(p => ({ verse: p, reference: 'John 3:16' }))} />
                )}
                {activeTab === PRAYER_AI_TABS.Prayer && data.prayer && (
                  <ResponseContainer type={activeTab} response={data.prayer} />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-500 mb-2">
                  {activeTab === PRAYER_AI_TABS.Promise
                    ? "Ask about divine promises"
                    : "Seek guidance through prayer"}
                </p>
                <p className="text-sm text-gray-400">
                  Type your question above to receive personalized content
                </p>
              </div>
            )}
          </div>
        )}


      </div>

    </div>
  );
}
