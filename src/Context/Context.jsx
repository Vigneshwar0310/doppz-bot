import React, { createContext, useState, useEffect } from "react";
import run from "../Components/Config/Gemini";

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  // Initialize from localStorage or default values
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved
      ? JSON.parse(saved)
      : [
          "What is React?",
          "How to create components",
          "State management in React",
          "React best practices",
          "React Hooks explained",
          "React Router setup",
          "Redux vs Context",
          "React performance tips",
        ];
  });

  // Save to localStorage whenever recentSearches changes
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    const response = await run(prompt);
    setResultData(response);
    setLoading(false);
    setInput("");
  };

  return (
    <Context.Provider
      value={{
        input,
        setInput,
        showResult,
        setShowResult,
        loading,
        setLoading,
        resultData,
        setResultData,
        onSent,
        recentSearches,
        setRecentSearches,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
