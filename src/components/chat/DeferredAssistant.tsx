import { lazy, Suspense, useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Assistant = lazy(() => import('./FloatingChat').then(m => ({ default:m.FloatingChat })));
export function DeferredAssistant() {
  const [ready, setReady] = useState(false);
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    const open = () => { setRequested(true); setReady(true); };
    window.addEventListener('drm:open-assistant',open);
    // Keep the original first-session greeting timing without eager-loading chat on first paint.
    const timer = window.setTimeout(() => setReady(true), 5500);
    return () => { window.clearTimeout(timer); window.removeEventListener('drm:open-assistant',open); };
  }, []);
  const launcher = <Button variant="outline" size="icon" aria-label="Open chat" onClick={() => {setRequested(true);setReady(true);}} className="fixed bottom-5 right-5 z-[60] h-14 w-14 rounded-full bg-card shadow-card-soft"><MessageCircle className="h-6 w-6"/></Button>;
  return ready ? <Suspense fallback={launcher}><Assistant initiallyOpen={requested}/></Suspense> : launcher;
}