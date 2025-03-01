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
      className={`min-h-screen ${
        extended ? "w-64" : "w-20"
      } flex flex-col justify-between bg-[#121418] shadow-xl p-4 border-r border-[#2c303a] transition-all duration-300`}
    >
      <div className="flex flex-col items-center space-y-4 w-full">
        <motion.div
          className="flex items-center w-full justify-center cursor-pointer"
          onClick={() => setExtended((prev) => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <DiYeoman className="text-4xl text-[#2b7cd3]" />
          {extended && (
            <p className="text-lg font-semibold text-[#e6e9ef] ml-2">Doppler</p>
          )}
        </motion.div>

        <motion.div
          className="new-chat flex items-center justify-center w-full p-3 bg-[#1a1d23] rounded-lg cursor-pointer hover:bg-[#22252d] transition duration-200 ease-in-out"
          onClick={handleNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CiCirclePlus className="text-4xl text-[#2b7cd3]" />
          {extended && (
            <p className="text-md font-medium text-[#e6e9ef] ml-2">New Chat</p>
          )}
        </motion.div>

        {extended && (
          <div className="recent w-full">
            <p className="text-[#a0a7b5] text-xs mb-2 font-semibold text-left">
              Recent
            </p>
            {recentSearches.length > 0 ? (
              recentSearches.map((query, index) => (
                <motion.div
                  key={index}
                  className="recent-entry flex items-center justify-between p-3 w-full bg-[#1a1d23] mb-2 rounded-lg cursor-pointer hover:bg-[#22252d] transition duration-200 ease-in-out group"
                  onClick={() => handleChatSelect(query)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 flex-grow overflow-hidden">
                    <FaMessage className="text-2xl text-[#2b7cd3] min-w-[24px]" />
                    <p className="text-sm text-[#e6e9ef] truncate">{query}</p>
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
                    <RiDeleteBin6Line className="text-[#f05252] hover:text-red-400 w-4 h-4" />
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-[#a0a7b5] text-center mt-2">
                No recent chats
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
