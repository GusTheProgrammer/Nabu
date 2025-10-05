import '@/App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme-provider';
import { ClipboardProvider } from '@/clipboard-context';
import AppLayout from '@/AppLayout';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  const queryClient = new QueryClient();
  return (
    <ThemeProvider defaultMode='dark'>
      <ClipboardProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppLayout />
          </TooltipProvider>
        </QueryClientProvider>
      </ClipboardProvider>
    </ThemeProvider>
  );
}

export default App;
