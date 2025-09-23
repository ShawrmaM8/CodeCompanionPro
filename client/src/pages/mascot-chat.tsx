import { Layout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MascotChat } from "@/components/mascot/mascot-chat";

export default function MascotChatPage() {
  return (
    <Layout>
      <main className="flex-1 overflow-auto">
        <Header 
          title="AI Companion" 
          subtitle="Chat with your coding mentor and get personalized guidance" 
        />
        
        <div className="p-6">
          <MascotChat />
        </div>
      </main>
    </Layout>
  );
}
