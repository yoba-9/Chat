import Layout from '@/components/Layout';
import { ChatProvider } from '@/context/ChatContext';

export default function Home() {
  return (
    <ChatProvider>
      <Layout />
    </ChatProvider>
  );
}