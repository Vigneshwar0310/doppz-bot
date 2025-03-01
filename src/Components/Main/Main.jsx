import React, { useContext, useState, useEffect, useRef } from "react";
import { GrGallery } from "react-icons/gr";
import { FaMicrophone } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoSendSharp } from "react-icons/io5";
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { Context } from "../../Context/Context";

const Main = () => {
  const {
    input,
    setInput,
    showResult,
    loading,
    resultData,
    onSent,
    recentSearches,
    setRecentSearches,
  } = useContext(Context);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [recentPrompt, setRecentPrompt] = useState("");
  const [display, setDisplay] = useState("");

  const formatAsBulletPoints = (text) => {
    if (!text) return "";
    text = text.replace(/[\*#_`~\[\]]/g, "");

    const allSentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim())
      .map((s) => s.replace(/[\*#_`~\[\]]/g, ""));

    // Find any natural conclusion in the text
    const conclusionIndex = allSentences.findIndex((s) =>
      s.match(
        /in conclusion|to summarize|finally|overall|in summary|therefore|thus|hence|ultimately/i
      )
    );

    // Count words and find appropriate endpoint
    let wordCount = 0;
    let cutoffIndex = -1;

    for (let i = 0; i < allSentences.length; i++) {
      const sentenceWords = allSentences[i].split(/\s+/).length;
      wordCount += sentenceWords;

      if (wordCount > 300 && cutoffIndex === -1) {
        if (conclusionIndex !== -1 && i >= conclusionIndex && wordCount < 350) {
          cutoffIndex = conclusionIndex + 2;
          break;
        }
        if (
          allSentences[i].match(
            /importantly|specifically|for example|such as|including/i
          ) ||
          allSentences[i + 1]?.match(/therefore|thus|hence|consequently/i)
        ) {
          continue;
        }
        if (i < allSentences.length - 1 && wordCount < 350) {
          cutoffIndex = i + 1;
        } else {
          cutoffIndex = i;
        }
      }
    }

    if (cutoffIndex === -1) cutoffIndex = allSentences.length;

    const sentences = allSentences.slice(0, cutoffIndex);

    // Organize into paragraphs
    const paragraphs = [];
    let currentParagraph = [];
    let conclusionSentences = [];

    sentences.forEach((sentence, index) => {
      if (index >= conclusionIndex && conclusionIndex !== -1) {
        conclusionSentences.push(sentence);
      } else {
        currentParagraph.push(sentence);
        if (
          currentParagraph.length >= 3 ||
          sentence.match(/types|examples|features|benefits|importantly/i) ||
          index === sentences.length - 1
        ) {
          if (currentParagraph.length > 0) {
            paragraphs.push(currentParagraph.join(" "));
            currentParagraph = [];
          }
        }
      }
    });

    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(" "));
    }

    let formattedText = paragraphs.join("\n\n");

    if (conclusionSentences.length > 0) {
      formattedText += "\n\n" + conclusionSentences.join(" ");
    } else if (sentences.length > 0) {
      const lastParagraph = sentences.slice(-2).join(" ");
      formattedText =
        formattedText.replace(/[^.!?]+[.!?]$/, "") + "\n\n" + lastParagraph;
    }

    return formattedText.trim();
  };

  // Fast typewriter effect without external library
  useEffect(() => {
    if (!loading && resultData && showResult) {
      // Format and limit response
      const formattedResponse = formatAsBulletPoints(resultData);

      if (charIndex < formattedResponse.length) {
        const timer = setTimeout(() => {
          setDisplayedResponse((prev) => prev + formattedResponse[charIndex]);
          setCharIndex(charIndex + 1);
        }, 5); // Very fast typing speed
        return () => clearTimeout(timer);
      }
    }
  }, [loading, resultData, charIndex, showResult]);

  // Reset displayed text when new response is loading
  useEffect(() => {
    if (loading) {
      setDisplayedResponse("");
      setCharIndex(0);
    }
  }, [loading]);

  const handleSend = () => {
    if (input.trim()) {
      setDisplay(input);
      // Update recent searches in Context with better duplicate handling
      setRecentSearches((prev) => {
        // Remove the input if it exists and add it to the front
        const filtered = prev.filter(
          (item) => item.toLowerCase() !== input.toLowerCase()
        );
        const newSearches = [input, ...filtered].slice(0, 20); // Keep last 20 searches
        return newSearches;
      });
      setRecentPrompt(
        input +
          "\n\nRESPONSE REQUIREMENTS:\n" +
          "1. Maximum length: 250 words\n" +
          "3. Formatting rules:\n" +
          "   - No markdown, bullets, or special characters\n" +
          "   - Use plain text only\n" +
          "   - Separate sections with line breaks\n" +
          "   - Use CAPS for section headers\n" +
          "4. Keep language simple and direct\n" +
          "5. Prioritize readability over technical jargon"
      );
      onSent(input);
    }
  };

  // Handle enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle microphone icon click
  const handleMicrophoneClick = () => {
    if (recognitionRef.current) {
      try {
        if (!isListening) {
          recognitionRef.current.start();
        } else {
          recognitionRef.current.stop();
        }
        setIsListening(!isListening);
      } catch (error) {
        console.error("Speech recognition error:", error);
        setIsListening(false);
      }
    } else {
      setIsListening(!isListening);
      if (!isListening) {
        setTimeout(() => {
          setInput((prev) => prev + " (Voice input would appear here)");
          setIsListening(false);
        }, 2000);
      }
    }
  };

  // File upload handlers
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleGenerateResponse = async () => {
    if (!input.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const mockResponse =
        "AI-generated response. It provides insights. Useful in many cases.";
      setResponse(formatResponse(mockResponse));
      setLoading(false);
    }, 2000);
  };

  const handleFiles = (files) => {
    const fileNames = Array.from(files)
      .map((file) => file.name)
      .join(", ");
    alert(`Files selected: ${fileNames}`);
    setShowGallery(false);
  };

  const formatResponse = (text) => {
    if (!text) return "";

    // Remove all markdown and special characters
    text = text.replace(/[\*#_`~\[\]]/g, "");

    return formatAsBulletPoints(text);
  };

  return (
    <div className="main flex-1 relative h-screen flex flex-col items-center overflow-hidden bg-[#121418] text-[#e6e9ef]">
      {/* Main content area with flex layout */}
      <div className="w-full h-full flex flex-col max-w-[900px] px-4">
        {/* Chat Area - Takes up most of the screen space */}
        <div
          ref={chatContainerRef}
          className="chat-container flex-grow overflow-y-auto py-4 mb-4"
        >
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="welcome-content h-full flex flex-col justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="greet mb-10 text-[42px] md:text-[56px] font-semibold p-[20px] text-center"
                >
                  <p>
                    <span className="bg-gradient-to-r from-[#2b7cd3] to-[#1f6feb] bg-clip-text text-transparent">
                      Hello, Doppler...
                    </span>
                  </p>
                  <p className="text-[#e6e9ef]">How Can I Help You ?</p>
                </motion.div>

                <div className="cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-[20px]">
                  {recentSearches.slice(0, 4).map((text, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                      }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="card hover:bg-[#22252d] relative h-[170px] p-[15px] bg-[#1a1d23] border border-[#2c303a] rounded-lg cursor-pointer shadow-md overflow-hidden"
                      onClick={() => {
                        setInput(text);
                        onSent(text);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-[#e6e9ef] pr-6">{text}</p>
                        <motion.div
                          className="p-1 hover:bg-[#22252d] rounded-full"
                          whileHover={{ scale: 1.1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecentSearches((prev) =>
                              prev.filter((item) => item !== text)
                            );
                          }}
                        >
                          <RiDeleteBin6Line className="text-[#df7373] hover:text-red-400 w-4 h-4" />
                        </motion.div>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="absolute bottom-4 right-4"
                      >
                        <FaSearch className="w-8 h-8 p-2 bg-[#22252d] border border-[#2c303a] rounded-full shadow-md text-[#2b7cd3]" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="response"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="response-container space-y-4"
              >
                {/* Input display - Always visible */}
                <motion.div
                  className="input-display p-4 bg-[#1a1d23] rounded-lg border border-[#2c303a] shadow-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 min-w-8 bg-[#2b7cd3] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">You</span>
                    </div>
                    <p className="text-[#e6e9ef] font-medium">{display}</p>
                  </div>
                </motion.div>

                {/* AI Response - With enhanced styling and bullet points */}
                <motion.div
                  className="ai-response bg-[#1a1d23] rounded-lg p-4 shadow-lg border border-[#2c303a]"
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: 0.2,
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 min-w-8 bg-gradient-to-r from-[#2b7cd3] to-[#1f6feb] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">D</span>
                    </div>
                    <p className="text-[#a0a7b5] font-medium">Doppler AI</p>
                  </div>

                  {loading ? (
                    <div className="flex space-x-1 ml-11">
                      <motion.span
                        className="h-2 w-2 bg-[#2b7cd3] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="h-2 w-2 bg-[#2b7cd3] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <motion.span
                        className="h-2 w-2 bg-[#2b7cd3] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-[#e6e9ef] text-lg leading-relaxed ml-11 whitespace-pre-line">
                      {displayedResponse}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area - Fixed at the bottom */}
        <div className="input-container pb-8 w-full">
          <motion.div
            className={`gemini-input flex items-center bg-[#1a1d23] border ${
              isInputFocused
                ? "border-[#2b7cd3] shadow-lg"
                : "border-[#2c303a] shadow-md"
            } rounded-2xl transition-all duration-200`}
            animate={{
              boxShadow: isInputFocused
                ? "0 4px 12px rgba(43, 124, 211, 0.3)"
                : "0 1px 3px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Input field */}
            <div className="flex-grow px-4 flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Ask me anything..."
                rows={1}
                className="w-full py-5 text-lg resize-none outline-none bg-transparent text-[#e6e9ef] placeholder-[#a0a7b5]"
                style={{
                  minHeight: "56px",
                  maxHeight: "150px",
                  overflow: "auto",
                  lineHeight: "1.5",
                }}
              />
            </div>

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!input.trim()}
              onClick={handleSend}
              className={`flex items-center justify-center w-12 h-12 rounded-full mx-2 ${
                input.trim()
                  ? "bg-[#2b7cd3] hover:bg-[#1f6feb]"
                  : "bg-[#22252d] cursor-not-allowed"
              } transition-colors duration-200`}
            >
              <IoSendSharp
                className={input.trim() ? "text-white" : "text-[#a0a7b5]"}
                size={20}
              />
            </motion.button>
          </motion.div>

          <p className="text-xs text-[#a0a7b5] text-center mt-3">
            Doppler AI may take a moment to respond....
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
