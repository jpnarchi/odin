import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { AuthGuard } from '~/components/auth/AuthGuard';

export const meta: MetaFunction = () => {
  return [
    { title: 'Geek' },
    { name: 'description', content: 'Habla con Geek, un agente de IA que crea tus ideas en proyectos.' }
  ];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <AuthGuard>
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </AuthGuard>
    </div>
  );
}