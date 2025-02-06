import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { authStore } from '~/lib/stores/auth';
import { useNavigate } from '@remix-run/react';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export function SendButton({ show, isStreaming, onClick }: SendButtonProps) {
  const user = useStore(authStore.user);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    onClick?.(event);
  };

  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          className="absolute flex justify-center items-center top-[18px] right-[22px] p-1 bg-accent-500 hover:brightness-94 color-white rounded-md w-[34px] h-[34px] transition-theme"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={(event) => {
            event.preventDefault();
            handleClick(event);
          }}
        >
          <div className="text-lg">
            {!isStreaming ? <div className="i-ph:arrow-right"></div> : <div className="i-ph:stop-circle-bold"></div>}
          </div>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}