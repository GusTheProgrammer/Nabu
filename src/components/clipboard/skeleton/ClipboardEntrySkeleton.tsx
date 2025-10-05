import { Skeleton } from '@/components/ui/skeleton';

export default function ClipboardItemSkeleton() {
  return (
    <div className='h-[50px]'>
      <div className='flex items-center gap-3 px-4 py-3 border-b border-border h-full'>
        <Skeleton className='w-6 h-6' />
        <div className='flex-1 min-w-0'>
          <Skeleton className='h-4 w-3/4' />
        </div>
      </div>
    </div>
  );
}
