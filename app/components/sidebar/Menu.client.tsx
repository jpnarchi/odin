import { useStore } from '@nanostores/react';
import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { IconButton } from '~/components/ui/IconButton';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { db, deleteById, getAll, chatId } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { logger } from '~/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import { authStore } from '~/lib/stores/auth';
import { conversationsStore, type Conversation } from '~/lib/stores/conversations';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { supabase } from '~/lib/supabase/client';

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent = { type: 'delete'; item: Conversation } | null;

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const user = useStore(authStore.user);
  const navigate = useNavigate();

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await conversationsStore.listConversations();
      setConversations(data || []);
    } catch (error) {
      toast.error('Error loading conversations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteConversation = useCallback(async (conversation: Conversation) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversation.id));
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error(error);
    }
  }, []);

  const handleAuth = () => {
    if (user) {
      authStore.signOut();
    } else {
      navigate('/auth/login');
    }
  };

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open, loadConversations]);

  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (event.pageX < enterThreshold) {
        setOpen(true);
      }

      if (menuRef.current && event.clientX > menuRef.current.getBoundingClientRect().right + exitThreshold) {
        setOpen(false);
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <motion.div
      ref={menuRef}
      initial="closed"
      animate={open ? 'open' : 'closed'}
      variants={menuVariants}
      className="flex flex-col side-menu fixed top-0 w-[350px] h-full bg-bolt-elements-background-depth-2 border-r rounded-r-3xl border-bolt-elements-borderColor z-sidebar shadow-xl shadow-bolt-elements-sidebar-dropdownShadow text-sm"
    >
      <div className="flex items-center h-[var(--header-height)]">{/* Placeholder */}</div>
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <div className="p-4">
          <a
            href="/"
            className="flex gap-2 items-center bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-md p-2 transition-theme"
          >
            <span className="inline-block i-bolt:chat scale-110" />
            Iniciar nuevo chat
          </a>
        </div>
        <div className="text-bolt-elements-textPrimary font-medium pl-6 pr-5 my-2">Tus Chats</div>
        <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
          {loading ? (
            <LoadingSpinner />
          ) : conversations.length === 0 ? (
            <div className="pl-2 text-bolt-elements-textTertiary">No hay conversaciones previas</div>
          ) : (
            <DialogRoot open={dialogContent !== null}>
              {conversations.map((conversation) => (
                <div key={conversation.id} className="mt-4 first:mt-0 space-y-1">
                  <HistoryItem
                    item={{
                      id: conversation.id,
                      description: conversation.title,
                      urlId: conversation.id,
                      timestamp: conversation.created_at,
                      messages: conversation.messages
                    }}
                    onDelete={() => setDialogContent({ type: 'delete', item: conversation })}
                  />
                </div>
              ))}
              <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
                {dialogContent?.type === 'delete' && (
                  <>
                    <DialogTitle>¿Eliminar chat?</DialogTitle>
                    <DialogDescription asChild>
                      <div>
                        <p>
                          Estás a punto de eliminar <strong>{dialogContent.item.title}</strong>.
                        </p>
                        <p className="mt-1">¿Estás seguro de que quieres eliminar este chat?</p>
                      </div>
                    </DialogDescription>
                    <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
                      <DialogButton type="secondary" onClick={closeDialog}>
                        Cancelar
                      </DialogButton>
                      <DialogButton
                        type="danger"
                        onClick={() => {
                          deleteConversation(dialogContent.item);
                          closeDialog();
                        }}
                      >
                        Eliminar
                      </DialogButton>
                    </div>
                  </>
                )}
              </Dialog>
            </DialogRoot>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-bolt-elements-borderColor p-4">
          <button
            onClick={handleAuth}
            className="flex items-center gap-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
          >
            <div className={user ? "i-ph:sign-out" : "i-ph:sign-in"} />
            {user ? "Cerrar sesión" : "Iniciar sesión"}
          </button>
          <ThemeSwitch className="ml-auto" />
        </div>
      </div>
    </motion.div>
  );
}