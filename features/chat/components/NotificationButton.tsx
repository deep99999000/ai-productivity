import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotificationButton = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        new Notification('Notifications Enabled!', {
          body: 'You will now receive chat notifications',
          icon: '/favicon.ico',
        });
      }
    }
  };

  if (!('Notification' in window)) {
    return null;
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Bell size={16} />
        <span>Notifications enabled</span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <BellOff size={16} />
        <span>Notifications blocked</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={requestPermission}
      className="w-full"
    >
      <Bell size={16} className="mr-2" />
      Enable Notifications
    </Button>
  );
};
