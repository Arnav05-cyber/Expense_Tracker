declare module "react-native-get-sms-android" {
  export interface SmsFilter {
    box?: "inbox" | "sent" | "draft";
    minDate?: number;
    maxDate?: number;
    bodyRegex?: string;
    read?: 0 | 1;
    _id?: number;
    thread_id?: number;
    address?: string;
    body?: string;
    indexFrom?: number;
    maxCount?: number;
  }

  export function list(
    filter: string,
    fail: (error: string) => void,
    success: (count: number, smsList: string) => void,
  ): void;
}
