import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster position="bottom-right" richColors={true} toastOptions={{ duration: 5000 }} />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Providers;
