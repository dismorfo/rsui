import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Folder, File, ChevronRight, Search, Table, LayoutGrid } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

interface Collection {
  storage_url: string;
}

const FileExplorer = () => {
  const [currentData, setCurrentData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { collection } = usePage<{
    collection: Collection;
  }>().props;

  useEffect(() => {
    const rootUrl = collection.storage_url.replace('https://dev-rsbe.dlib.nyu.edu/api/v0/', '/fs/');
    fetch(rootUrl)
      .then(res => res.json())
      .then(setCurrentData);
  }, [collection.storage_url]);

  const handleClick = async (item) => {
    setSelected(item.name);
    if (item.object_type === 'directory') {
      const url = item.url.replace('https://dev-rsbe.dlib.nyu.edu/api/v0/', '/fs/');
      const res = await fetch(url);
      const data = await res.json();
      setHistory(prev => [...prev, currentData]);
      setCurrentData(data);
      setFilter('');
    }
  };

  const goToIndex = async (index) => {
    const newHistory = history.slice(0, index);
    const target = history[index];
    setHistory(newHistory);
    setCurrentData(target);
    setSelected(null);
    setFilter('');
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  if (!currentData) return <div className="p-4">Loading...</div>;

  const filteredChildren = (currentData.children || []).filter(item =>
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
        <span className="truncate max-w-[120px]" title={currentData.name}>{currentData.name}</span>
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
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')} size="icon">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')} size="icon">
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(filteredChildren.length === 0) ? (
        <div className="text-center text-gray-400 py-10">No matching files or folders.</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredChildren.map(item => (
            <HoverCard key={item.name}>
              <HoverCardTrigger asChild>
                <Card
                  onClick={() => handleClick(item)}
                  className={cn(
                    'cursor-pointer hover:bg-accent hover:text-accent-foreground transition',
                    selected === item.name && 'ring ring-blue-400'
                  )}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    {item.object_type === 'directory' ? <Folder className="h-6 w-6 mb-2" /> : <File className="h-6 w-6 mb-2" />}
                    <div className="text-sm font-medium truncate w-full" title={item.name}>{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(item.last_modified)}</div>
                    {item.object_type === 'file' && item.size !== undefined && (
                      <div className="text-xs text-gray-500">{item.size} bytes</div>
                    )}
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 text-sm">
                <div className="font-semibold mb-1 truncate" title={item.name}>{item.name}</div>
                <div>Type: {item.object_type}</div>
                <div>Last Modified: {formatDate(item.last_modified)}</div>
                {item.object_type === 'file' && item.size !== undefined && (
                  <div>Size: {item.size} bytes</div>
                )}
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-2 font-medium">Name</th>
                <th className="p-2 font-medium">Type</th>
                <th className="p-2 font-medium">Last Modified</th>
                <th className="p-2 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map(item => (
                <tr
                  key={item.name}
                  className="hover:bg-accent cursor-pointer"
                  onClick={() => handleClick(item)}
                >
                  <td className="p-2 truncate max-w-xs" title={item.name}>{item.name}</td>
                  <td className="p-2">{item.object_type}</td>
                  <td className="p-2">{formatDate(item.last_modified)}</td>
                  <td className="p-2">{item.object_type === 'file' ? `${item.size} bytes` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
