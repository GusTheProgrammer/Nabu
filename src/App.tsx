import '@/App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme-provider';
import { ClipboardProvider } from '@/clipboard-context';
import AppLayout from '@/AppLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { KeyboardProvider } from '@/context/keyboard-context.tsx';

function App() {
  const queryClient = new QueryClient();
  return (
    <ThemeProvider defaultMode='dark'>
      <ClipboardProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AppLayout />
            </TooltipProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </ClipboardProvider>
    </ThemeProvider>
  );
}

export default App;
