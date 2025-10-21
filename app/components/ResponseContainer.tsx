import React from "react";
import { saveReaction } from "../services/promise";

const PRAYER_AI_TABS = {
  Promise: "arkai_promise",
  Prayer: "arkai_prayer"
};

interface PromiseItem {
  verse: string;
  reference: string;
}

interface ResponseContainerProps {
  type: string;
  response: PromiseItem[] | string;
}

export function ResponseContainer({ type, response }: ResponseContainerProps) {
  const [reactions, setReactions] = React.useState<Record<string, string | null>>({});
  const [showAllPromises, setShowAllPromises] = React.useState(false);

  const DEFAULT_VISIBLE_PROMISES = 5;

  const handleReaction = async (index: number, reactionType: string) => {
    const key = `${type}_${index}`;

    // Generate user ID (in a real app, get this from auth context)
    const userId = "fb9e0361-6500-4f88-866d-38fbdbd857ac"; // Use a hardcoded ID for demo

    const previousReaction = reactions[key];

    try {
      setReactions((prev) => ({
        ...prev,
        [key]: prev[key] === reactionType ? null : reactionType,
      }));

      // Get the content for the API call
      let content;
      if (type === PRAYER_AI_TABS.Promise) {
        const promisesArray = response as PromiseItem[];
        content = `"${promisesArray[index].verse}"`; // Format verse as in the curl example
      } else {
        content = response as string; // Prayer content
      }

      // Call the real saveReaction API
      await saveReaction({
        response_type: type,
        user_id: userId,
        response: content,
        reaction: reactionType
      });

      console.log(`Reaction ${reactionType} saved for ${key}`);
      showToast(`Successfully ${reactionType}d!`);
    } catch (error) {
      // Revert on error
      setReactions((prev) => ({
        ...prev,
        [key]: previousReaction,
      }));
      showToast("Failed to save reaction. Please try again.");
    }
  };

  const handleCopy = (originalText: string, translatedText?: string, isTranslated?: boolean) => {
    const textToCopy = isTranslated && translatedText ? translatedText : originalText;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Text copied to clipboard!");
    }).catch(() => {
      showToast("Failed to copy text.");
    });
  };

  const showToast = (message: string) => {
    // Simple toast implementation - in a real app you'd use a toast library
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };



  if (type === PRAYER_AI_TABS.Promise) {
    const promisesArray = response as PromiseItem[];
    const promisesToShow = showAllPromises ? promisesArray : promisesArray.slice(0, DEFAULT_VISIBLE_PROMISES);

    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">God's Promises For You</h2>
        {promisesToShow.map((item, index) => {
          return (
            <div key={index} className="ml-3 mb-3">
              <p className="text-sm text-gray-800 leading-relaxed">
                {item.verse}
              </p>
              <p className="text-blue-600 italic mt-1.5 text-right">
                - {item.reference}
              </p>

              <div className="flex items-center mt-2 mb-3 gap-4">
                <button
                  onClick={() => handleCopy(item.verse)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2-2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleReaction(index, "like")}
                  className={`p-1 hover:bg-gray-100 rounded transition-colors ${reactions[`${type}_${index}`] === "like" ? "text-blue-600" : "text-gray-600"}`}
                  title="Like"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleReaction(index, "dislike")}
                  className={`p-1 hover:bg-gray-100 rounded transition-colors ${reactions[`${type}_${index}`] === "dislike" ? "text-red-600" : "text-gray-600"}`}
                  title="Dislike"
                  style={{ transform: 'rotate(180deg)' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                  </svg>
                </button>
              </div>

              {index < promisesToShow.length - 1 && <div className="h-px bg-gray-300 mt-1" />}
            </div>
          );
        })}

        {promisesArray && promisesArray.length > DEFAULT_VISIBLE_PROMISES && !showAllPromises && (
          <button
            onClick={() => setShowAllPromises(true)}
            className="text-blue-600 font-semibold text-sm mt-2 px-2 py-1 hover:text-blue-700"
          >
            Read More...
          </button>
        )}
      </div>
    );
  } else if (type === PRAYER_AI_TABS.Prayer) {
    return (
      <div className="p-4">
        <p className="text-black leading-relaxed">
          {response as string}
        </p>
        <div className="flex items-center mt-3 gap-4">
          <button
            onClick={() => handleCopy(response as string)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2-2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => handleReaction(0, "like")}
            className={`p-1 hover:bg-gray-100 rounded transition-colors ${reactions[`${type}_0`] === "like" ? "text-blue-600" : "text-gray-600"}`}
            title="Like"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
          </button>
          <button
            onClick={() => handleReaction(0, "dislike")}
            className={`p-1 hover:bg-gray-100 rounded transition-colors ${reactions[`${type}_0`] === "dislike" ? "text-red-600" : "text-gray-600"}`}
            title="Dislike"
            style={{ transform: 'rotate(180deg)' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
          </button>
        </div>
        <div className="h-px bg-gray-300 mt-3" />
      </div>
    );
  }

  return null;
}
