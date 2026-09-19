import { Titlebar } from "@/components/titlebar";

function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Titlebar />
      <main className="flex-1" />
    </div>
  );
}

export default App;
