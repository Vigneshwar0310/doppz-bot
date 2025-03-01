import React, { useState, useContext } from "react";
import { DiYeoman } from "react-icons/di";
import { CiCirclePlus } from "react-icons/ci";
import { FaMessage } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { motion } from "framer-motion";
import { Context } from "../../Context/Context";

const SideBar = () => {
  const { setInput, onSent, setShowResult, recentSearches, setRecentSearches } =
    useContext(Context);
  const [extended, setExtended] = useState(false);

  const handleNewChat = () => {
    setShowResult(false);
    setInput("");
  };

  const handleChatSelect = (query) => {
    setInput(query);
    onSent(query);
    setShowResult(true);
  };

  return (
    <div
      className={`sm:min-h-screen fixed sm:relative top-0 sm:top-auto left-0 right-0 sm:right-auto ${
        extended ? "sm:w-64" : "sm:w-20"
      } flex sm:flex-col justify-between bg-[#121418] shadow-xl border-b sm:border-b-0 sm:border-r border-[#2c303a] transition-all duration-300 z-50`}
    >
      <div className="flex sm:flex-col items-center sm:space-y-4 w-full p-2 sm:p-4">
        {/* Mobile Top Nav */}
        <div className="flex sm:flex-col w-full items-center justify-between sm:justify-start sm:space-y-4">
          <div className="flex items-center">
            <motion.div
              className="flex items-center justify-center cursor-pointer relative"
              onClick={() => setExtended((prev) => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DiYeoman className="text-2xl sm:text-4xl text-[#2b7cd3]" />
              {extended && (
                <p className="hidden sm:block text-base sm:text-lg font-semibold text-[#e6e9ef] ml-2">
                  Doppler
                </p>
              )}
            </motion.div>
            <span className="sm:hidden text-base font-semibold text-[#e6e9ef] ml-2">
              Doppler
            </span>
          </div>

          <motion.div
            className="new-chat flex items-center justify-center p-2 sm:p-3 bg-[#1a1d23] rounded-lg cursor-pointer hover:bg-[#22252d] transition duration-200 ease-in-out"
            onClick={handleNewChat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CiCirclePlus className="text-2xl sm:text-4xl text-[#2b7cd3]" />
            {extended && (
              <p className="hidden sm:block text-sm sm:text-md font-medium text-[#e6e9ef] ml-2">
                New Chat
              </p>
            )}
          </motion.div>
        </div>

        {/* Recent Chats Panel - Only visible when extended on desktop */}
        {extended && (
          <div className="hidden sm:block recent w-full">
            <p className="text-[#a0a7b5] text-[10px] sm:text-xs mb-2 font-semibold text-left">
              Recent
            </p>
            {recentSearches.length > 0 ? (
              recentSearches.map((query, index) => (
                <motion.div
                  key={index}
                  className="recent-entry flex items-center justify-between p-2 sm:p-3 w-full bg-[#1a1d23] mb-2 rounded-lg cursor-pointer hover:bg-[#22252d] transition duration-200 ease-in-out group"
                  onClick={() => handleChatSelect(query)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-grow overflow-hidden">
                    <FaMessage className="text-xl sm:text-2xl text-[#2b7cd3] min-w-[20px] sm:min-w-[24px]" />
                    <p className="text-xs sm:text-sm text-[#e6e9ef] truncate">
                      {query}
                    </p>
                  </div>
                  <motion.div
                    className="p-1 hover:bg-[#22252d] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecentSearches((prev) =>
                        prev.filter((item) => item !== query)
                      );
                    }}
                  >
                    <RiDeleteBin6Line className="text-[#f05252] hover:text-red-400 w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <p className="text-[10px] sm:text-xs text-[#a0a7b5] text-center mt-2">
                No recent chats
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile Recent Chats Dropdown */}
      {extended && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="sm:hidden fixed top-14 left-2 w-64 bg-[#121418] border border-[#2c303a] p-4 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl"
        >
          <p className="text-[#a0a7b5] text-xs mb-3 font-semibold">
            Recent Chats
          </p>
          {recentSearches.length > 0 ? (
            recentSearches.map((query, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-[#1a1d23] mb-2 rounded-lg"
                onClick={() => {
                  handleChatSelect(query);
                  setExtended(false);
                }}
              >
                <div className="flex items-center space-x-3 flex-grow overflow-hidden">
                  <FaMessage className="text-xl text-[#2b7cd3]" />
                  <p className="text-sm text-[#e6e9ef] truncate">{query}</p>
                </div>
                <motion.div
                  className="p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecentSearches((prev) =>
                      prev.filter((item) => item !== query)
                    );
                  }}
                >
                  <RiDeleteBin6Line className="text-[#f05252] w-4 h-4" />
                </motion.div>
              </motion.div>
            ))
          ) : (
            <p className="text-xs text-[#a0a7b5] text-center mt-2">
              No recent chats
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SideBar;
