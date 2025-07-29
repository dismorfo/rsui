import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Folder, File, ChevronRight, Search, Table, LayoutGrid } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FileItem, Storage } from '@/types';
import FilePreviewDialogTrigger from '@/components/FilePreviewDialogTrigger'; // Adjust path
import mime from 'mime';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

const FileExplorer = ({ storage, partnerId, collectionId }: { storage: Storage[], partnerId: string, collectionId: string }) => {

  const [currentData, setCurrentData] = useState<FileItem | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storage && storage.length > 0) {
      // The last item from the 'storage' prop is the initial current directory
      const initialCurrentDirectory = storage[storage.length - 1];

      // All items *before* the last one form the initial history.
      // We need to ensure these items (from 'storage') are treated as FileItem and have a 'url'.
      const initialHistoryItems: FileItem[] = storage.slice(0, storage.length - 1)
        .filter((item): item is FileItem => !!(item as FileItem).url); // Filter out any history items without a URL

      // Fetch data for the initial current directory. This item MUST have a URL.
      fetchData(initialCurrentDirectory);
      setHistory(initialHistoryItems);
      setSelected(null);
      setFilter('');
    }
  }, [storage]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setHistory(event.state.history);
        setCurrentData(event.state.currentData);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (currentData && currentData.url) {
      const baseUrlPart = `/fs/paths/${partnerId}/${collectionId}`;
      let newPath = '';

      if (currentData.url === baseUrlPart) {
        // This is the collection root
        newPath = `/collections/${collectionId}`;
      } else if (currentData.url.startsWith(baseUrlPart + '/')) {
        // This is a sub-path
        const pathSegments = currentData.url.substring(baseUrlPart.length + 1);
        newPath = `/paths/${partnerId}/${collectionId}/${pathSegments}`;
      } else {
        // Fallback to collection root if URL structure is unexpected
        newPath = `/collections/${collectionId}`;
      }
      window.history.pushState({ history, currentData }, '', newPath);
    }
  }, [currentData, history, partnerId, collectionId, storage]);

  const fetchData = async (itemToFetch: { url: string }) => {
    setLoading(true);
    try {
      // Defensive check: Ensure itemToFetch.url is always a string here
      if (!itemToFetch.url) {
        console.error("Error: Attempted to fetch data for an item with no URL:", itemToFetch);
        return; // Prevent making a request with an undefined URL
      }
      const res = await fetch(itemToFetch.url);
      const data = await res.json();
      setCurrentData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (item: FileItem) => {
    console.log("Clicked item:", item);
    if (item.object_type === 'directory') {
      setLoading(true);
      // Defensive check: A clicked directory MUST have a URL to navigate into it
      if (!item.url) {
        console.error("Error: Clicked directory has no URL:", item);
        setLoading(false);
        return;
      }
      const res = await fetch(item.url);
      const data = await res.json();

      if (currentData) {
        console.log('data', data)
        console.log('currentData', currentData)
        // When pushing to history, ensure 'currentData' (which is a FileItem) has a URL.
        // This is where the problematic object from your error might have entered history.
        if (currentData.object_type === 'directory' && !currentData.url) {
          console.warn("Warning: Attempting to add a directory to history without a URL:", currentData);
        }
        setHistory((prev) => [...prev, currentData]);
      }
      setCurrentData(data);
      setFilter('');
      setSelected(null);
      setLoading(false);
    } else {
      setSelected(item.name);
    }
  };

  const goToIndex = async (index: number) => {
    setLoading(true);
    // The target item to navigate to is the one at the clicked index in the 'history' array
    const targetItem: FileItem = history[index];

    // Defensive check: Ensure the target history item is valid and has a URL
    if (!targetItem || !targetItem.url) {
        console.error("Error: Target history item has no URL or is null:", targetItem);
        setLoading(false);
        return;
    }

    // Slice history up to the clicked index to form the new history
    const newHistory = history.slice(0, index);

    // Pass the target item to fetchData
    await fetchData(targetItem); // fetchData expects an item with a 'url'

    setHistory(newHistory);
    setSelected(null);
    setFilter('');
    setLoading(false);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  const isDownloadable = (item: FileItem) =>
    item.object_type === 'file' &&
    item.size !== undefined &&
    item.size < 2 * 1024 * 1024 * 1024; // Less than 2GB

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-6 mb-2 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!currentData) {
    return <div className="p-4 text-center text-muted-foreground">No data</div>;
  }

  const filteredChildren = (currentData.children || []).filter((item: FileItem) =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-muted-foreground flex flex-wrap items-center gap-1">
        <span className="font-semibold">Path:</span>
        {history.map((h, i) => (
          <span key={i} className="flex items-center">
            {/* Only render button if the history item has a URL */}
            {h.url ? (
              <button
                onClick={() => goToIndex(i)}
                className="text-primary underline hover:text-primary/80 truncate max-w-[120px]"
                title={h.name}
              >
                {h.name}
              </button>
            ) : (
              <span className="text-muted-foreground truncate max-w-[120px]" title={`Unnavigable: ${h.name}`}>
                {h.name}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1" />
          </span>
        ))}
        {currentData.name && (
            <span className="truncate max-w-[120px]" title={currentData.name}>
            {currentData.name}
            </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter files or folders..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size="icon"
            aria-label="Table view"
            className="cursor-pointer"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            size="icon"
            aria-label="Grid view"
            className="cursor-pointer"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredChildren.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">Empty directory.</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredChildren.map((item: FileItem) => (
            item.object_type === 'file' || item.object_type === 'directory' ? (
              <ContextMenu key={item.name}>
                <ContextMenuTrigger asChild>
                  <div>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Card
                          onClick={() => handleClick(item)}
                          className={cn(
                            'cursor-pointer hover:bg-accent hover:text-accent-foreground transition',
                            selected === item.name && 'ring ring-primary'
                          )}
                        >
                          <CardContent className="p-4 flex flex-col items-center text-center">
                            {item.object_type === 'directory' ? (
                              <Folder className="h-6 w-6 mb-2" />
                            ) : (
                              <File className="h-6 w-6 mb-2" />
                            )}
                            <div className="text-sm font-medium truncate w-full" title={item.name}>
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDate(item.last_modified)}
                            </div>
                            {item.object_type === 'file' && item.display_size && (
                              <div className="text-xs text-muted-foreground">{item.display_size}</div>
                            )}
                          </CardContent>
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 text-sm">
                        <div className="font-semibold mb-1 truncate" title={item.name}>
                          {item.name}
                        </div>
                        <div>Type: {item.object_type}</div>
                        <div>Last Modified: {formatDate(item.last_modified)}</div>
                        {item.object_type === 'file' && item.display_size && (
                          <div>Size: {item.display_size}</div>
                        )}
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </ContextMenuTrigger>
                {item.object_type === 'file' && (
                  <ContextMenuContent>
                    {item.download_url && isDownloadable(item) && (
                      <ContextMenuItem onClick={() => window.open(item.download_url, '_blank')}>
                        Download
                      </ContextMenuItem>
                    )}
                    {/* {item.url && (
                      <ContextMenuItem onClick={() => window.open(item.url, '_blank')}>
                        Preview
                      </ContextMenuItem>
                    )} */}
                  </ContextMenuContent>
                )}
              </ContextMenu>
            ) : null
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-md max-h-[600px]">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left sticky top-0 z-10">
              <tr>
                <th className="p-2 font-medium">Name</th>
                <th className="p-2 font-medium">Type</th>
                <th className="p-2 font-medium">Size</th>
                <th className="p-2 font-medium">Preview</th>
                <th className="p-2 font-medium">Download</th>
                <th className="p-2 font-medium">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChildren.map((item: FileItem, index: number) => {
                const isEven = index % 2 === 0;
                const rowClasses = cn(
                  isEven ? 'bg-background' : 'bg-muted/50',
                  'hover:bg-accent',
                  item.object_type === 'directory' && 'cursor-pointer',
                  selected === item.name && 'ring ring-primary'
                );

                item.preview = false;

                // Hack to add mime type to the URL for previewing
                // This is a workaround to ensure the file can be previewed correctly
                // Fix will come from the backend in the future
                if (item.object_type === 'file' && !item.mime_type &&  item.download_url) { // Only proceed if it's a file and mime_type isn't already set
                    const displayFileUrl = item.download_url.replace('?download=true', '').replace('/download', '');
                    const parts = displayFileUrl.split('.');
                    const potentialExtension = parts.length > 1 ? parts.pop() : '';

                    if (potentialExtension && potentialExtension.length <= 4 && /^[a-zA-Z0-9]+$/.test(potentialExtension)) {
                        item.extension = potentialExtension.toLowerCase(); // Store in lowercase for consistency
                    } else {
                    // Otherwise, default to 'txt' for the extension
                    item.extension = 'txt';
                    }

                    // Now, deduct the mime_type based on the determined extension
                    if (item.object_type === 'file' && item.extension) { // Ensure extension is set
                    item.mime_type = mime.getType(item.extension) || 'application/octet-stream';
                    }

                    // Optional: If you specifically want 'text/plain' for the 'txt' extension
                    if (item.extension === 'txt' && !item.mime_type) { // This condition handles if 'txt' wasn't in the map
                        item.mime_type = 'text/plain';
                    }
                    console.log(item.mime_type)
                    // Set preview to true for specific mime types
                    switch (item.mime_type) {
                      case 'application/xml':
                      case 'application/json':
                      case 'text/plain':
                      case 'text/csv':
                      case 'text/xsl':
                      case 'application/xslt+xml':
                      case 'audio/wav':
                      case 'audio/mpeg':
                      case 'audio/ogg':
                      case 'audio/aac':
                      case 'video/mp4':
                      case 'video/webm':
                      case 'video/ogg':
                        item.preview = true;
                        break;
                   }

                }

                return item.object_type === 'file' ? (
                  <ContextMenu key={item.name}>
                    <ContextMenuTrigger asChild>
                      <tr
                        className={rowClasses}
                        tabIndex={0}
                      >
                        <td className="p-2 truncate max-w-xs" title={item.name}>{item.name}</td>
                        <td className="p-2">{item.object_type}</td>
                        <td className="p-2">{item.display_size}</td>
                        <td className="p-2">
                            {item.preview ? (
                              ( <FilePreviewDialogTrigger item={item} triggerLabel="Preview" /> )
                            ) : (
                              <div>
                                <HoverCard>
                                  <HoverCardTrigger><span className="text-muted-foreground/50">Not available</span></HoverCardTrigger>
                                  <HoverCardContent>
                                    <span>Unavailable at the moment — please check back soon.</span>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            )}
                        </td>
                        <td className="p-2">
                          {isDownloadable(item) && item.download_url ? (
                            <a href={item.download_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                              Download
                            </a>
                          ) : (
                            <HoverCard>
                              <HoverCardTrigger><span className="text-muted-foreground/50">N/A</span></HoverCardTrigger>
                              <HoverCardContent>
                                <span>Download for files over 2GB of size is not currently supported.</span>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                        </td>
                        <td className="p-2">{formatDate(item.last_modified)}</td>
                      </tr>
                    </ContextMenuTrigger>
                  </ContextMenu>
                ) : (
                  <tr
                    key={item.name}
                    className={rowClasses}
                    onClick={() => handleClick(item)}
                    tabIndex={0}
                  >
                    <td className="p-2 truncate max-w-xs" title={item.name}>{item.name}</td>
                    <td className="p-2">{item.object_type}</td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2">{formatDate(item.last_modified)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
