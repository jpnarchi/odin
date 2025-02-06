import { Outlet } from '@remix-run/react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bolt-elements-background-depth-1">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}