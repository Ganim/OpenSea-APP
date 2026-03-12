'use client';

import { useCallback } from 'react';

interface VideoPlayerProps {
  url: string;
  name: string;
}

const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

export function isVideoPreviewable(mimeType: string): boolean {
  return VIDEO_MIMES.includes(mimeType);
}

export function VideoPlayer({ url, name }: VideoPlayerProps) {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="w-full h-[50vh] rounded-lg overflow-hidden bg-black flex items-center justify-center">
      <video
        src={url}
        controls
        controlsList="nodownload"
        onContextMenu={handleContextMenu}
        className="w-full h-full object-contain"
        title={name}
      >
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
    </div>
  );
}
