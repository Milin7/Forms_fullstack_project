import { useEffect, useState } from "react";
import { api } from "../utils/api";

export function TestConnection() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Test the connection
    api
      .get("/")
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div>
      <h2>Backend Connection Test:</h2>
      <p>{message || "Loading..."}</p>
    </div>
  );
}
