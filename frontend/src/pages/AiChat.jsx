import { Helmet } from 'react-helmet-async';
import { VercelV0Chat } from '@/components/ui/v0-ai-chat';

export default function AiChat() {
  return (
    <>
      <Helmet><title>AI Assistant | Agoc Care</title></Helmet>
      <div className="min-h-screen bg-black flex items-center justify-center py-12">
        <VercelV0Chat />
      </div>
    </>
  );
}
