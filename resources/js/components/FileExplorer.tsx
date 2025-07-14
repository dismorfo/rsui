import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Folder, File, ChevronRight, Search, Table, LayoutGrid } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FileItem, Storage } from '@/types';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

const FileExplorer = ({ storage }: { storage: Storage }) => {
  const [currentData, setCurrentData] = useState<FileItem | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(storage);
    setHistory([]);
    setSelected(null);
    setFilter('');
  }, [storage]);

  const fetchData = async (storage: Storage) => {
    setLoading(true);
    try {
      const res = await fetch(storage.current);
      const data = await res.json();
      setCurrentData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (item: FileItem) => {
    if (item.object_type === 'directory') {
      setLoading(true);
      const res = await fetch(item.url);
      const data = await res.json();
      if (currentData) {
        setHistory((prev) => [...prev, currentData as FileItem]);
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
    const newHistory = history.slice(0, index);
    const target = history[index];
    setHistory(newHistory);
    setCurrentData(target);
    setSelected(null);
    setFilter('');
    setLoading(false);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  const isDownloadable = (item: FileItem) =>
    item.object_type === 'file' &&
    item.size !== undefined &&
    item.size < 2 * 1024 * 1024 * 1024;

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
    return <div className="p-4 text-center text-gray-500">No data</div>;
  }

  const filteredChildren = (currentData.children || []).filter((item: FileItem) =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-gray-500 flex flex-wrap items-center gap-1">
        <span className="font-semibold">Path:</span>
        {history.map((h, i) => (
          <span key={i} className="flex items-center">
            <button
              onClick={() => goToIndex(i)}
              className="text-blue-500 underline hover:text-blue-700 truncate max-w-[120px]"
              title={h.name}
            >
              {h.name}
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
          </span>
        ))}
        <span className="truncate max-w-[120px]" title={currentData.name}>
          {currentData.name}
        </span>
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
        <div className="text-center text-gray-400 py-10">No matching files or folders.</div>
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
                            selected === item.name && 'ring ring-blue-400'
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
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(item.last_modified)}
                            </div>
                            {item.object_type === 'file' && item.display_size && (
                              <div className="text-xs text-gray-500">{item.display_size}</div>
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
                    {item.url && (
                      <ContextMenuItem onClick={() => window.open(item.url, '_blank')}>
                        Preview
                      </ContextMenuItem>
                    )}
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
                <th className="p-2 font-medium">Last Modified</th>
                <th className="p-2 font-medium">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredChildren.map((item: FileItem, index: number) => {
                const isEven = index % 2 === 0;
                const rowClasses = cn(
                  isEven ? 'bg-white' : 'bg-gray-50',
                  'hover:bg-accent cursor-pointer',
                  selected === item.name && 'ring ring-blue-400'
                );

                return item.object_type === 'file' ? (
                  <ContextMenu key={item.name}>
                    <ContextMenuTrigger asChild>
                      <tr
                        className={rowClasses}
                        onClick={() => handleClick(item)}
                        tabIndex={0}
                      >
                        <td className="p-2 truncate max-w-xs" title={item.name}>{item.name}</td>
                        <td className="p-2">{item.object_type}</td>
                        <td className="p-2">{formatDate(item.last_modified)}</td>
                        <td className="p-2">{item.display_size}</td>
                      </tr>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {item.download_url && isDownloadable(item) && (
                        <ContextMenuItem onClick={() => window.open(item.download_url, '_blank')}>
                          Download -
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
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
                    <td className="p-2">{formatDate(item.last_modified)}</td>
                    <td className="p-2"></td>
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
