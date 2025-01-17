import FileView from "@/modules/home/components/files-management/file-view.tsx";
import Header from "@/modules/home/components/header";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FileView />
    </div>
  );
}
