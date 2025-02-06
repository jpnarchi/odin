import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { AuthGuard } from '~/components/auth/AuthGuard';
import { conversationsStore } from '~/lib/stores/conversations';

export async function loader(args: LoaderFunctionArgs) {
  return json({ id: args.params.id });
}

export default function ChatRoute() {
  const { id } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (id) {
      conversationsStore.getConversation(id)
        .catch(console.error);
    }
  }, [id]);

  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <AuthGuard>
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </AuthGuard>
    </div>
  );
}