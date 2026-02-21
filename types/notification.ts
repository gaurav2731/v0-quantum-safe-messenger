export interface AppNotification {
  title: string;
  body: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}
