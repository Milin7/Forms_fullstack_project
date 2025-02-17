import "./App.css";
import Login from "./components/Login";
import { TestConnection } from "./components/TestConnection";
function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world</h1>
      <TestConnection />
      <Login />
    </>
  );
}

export default App;
