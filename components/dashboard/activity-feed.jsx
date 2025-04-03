"use client";

import { useCallback } from "react";
import { formatDistance } from "date-fns";
import { id } from "date-fns/locale";
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Receipt,
  Clock,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon map for different activity types
const iconMap = {
  stt_created: Package,
  stt_updated: Package,
  pickup_created: Calendar,
  pickup_completed: Calendar,
  loading_created: Truck,
  loading_departed: Truck,
  loading_arrived: Truck,
  delivery_created: Truck,
  delivery_completed: CheckCircle,
  return_created: AlertCircle,
  collection_created: Receipt,
  collection_paid: DollarSign,
  user_login: User,
  user_created: User,
  default: Clock,
};

// Function to determine the appropriate icon
const getIcon = (type) => {
  return iconMap[type] || iconMap.default;
};

// Function to format time
const formatTime = (timestamp) => {
  try {
    return formatDistance(new Date(timestamp), new Date(), {
      addSuffix: true,
      locale: id,
    });
  } catch (error) {
    return "waktu tidak valid";
  }
};

export default function ActivityFeed({
  activities = [],
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
  className,
}) {
  // Render activity content based on type
  const renderActivityContent = useCallback((activity) => {
    const { type, user, data, timestamp } = activity;
    const time = formatTime(timestamp);

    switch (type) {
      case "stt_created":
        return (
          <div>
            <span className="font-medium">{user}</span> membuat STT baru{" "}
            <span className="font-medium">{data.noSTT}</span> untuk pengiriman
            dari {data.cabangAsal} ke {data.cabangTujuan}
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "stt_updated":
        return (
          <div>
            <span className="font-medium">{user}</span> memperbarui STT{" "}
            <span className="font-medium">{data.noSTT}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "pickup_created":
        return (
          <div>
            <span className="font-medium">{user}</span> membuat jadwal
            pengambilan untuk{" "}
            <span className="font-medium">{data.customer}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "pickup_completed":
        return (
          <div>
            <span className="font-medium">{user}</span> menyelesaikan
            pengambilan dari{" "}
            <span className="font-medium">{data.customer}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "loading_created":
        return (
          <div>
            <span className="font-medium">{user}</span> membuat muatan baru
            dengan ID <span className="font-medium">{data.idMuat}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "loading_departed":
        return (
          <div>
            <span className="font-medium">{user}</span> mencatat keberangkatan
            truck <span className="font-medium">{data.truckInfo}</span> dengan
            muatan {data.idMuat}
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "loading_arrived":
        return (
          <div>
            <span className="font-medium">{user}</span> mencatat kedatangan
            truck <span className="font-medium">{data.truckInfo}</span> dengan
            muatan {data.idMuat}
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "delivery_created":
        return (
          <div>
            <span className="font-medium">{user}</span> membuat penugasan lansir
            baru dengan ID <span className="font-medium">{data.idLansir}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "delivery_completed":
        return (
          <div>
            <span className="font-medium">{user}</span> menyelesaikan pengiriman
            ke <span className="font-medium">{data.penerima}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "return_created":
        return (
          <div>
            <span className="font-medium">{user}</span> mencatat retur untuk STT{" "}
            <span className="font-medium">{data.stt}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "collection_created":
        return (
          <div>
            <span className="font-medium">{user}</span> membuat penagihan untuk{" "}
            <span className="font-medium">{data.customer}</span> sebesar{" "}
            <span className="font-medium">{data.amount}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "collection_paid":
        return (
          <div>
            <span className="font-medium">{user}</span> mencatat pembayaran dari{" "}
            <span className="font-medium">{data.customer}</span> sebesar{" "}
            <span className="font-medium">{data.amount}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "user_login":
        return (
          <div>
            <span className="font-medium">{user}</span> masuk ke sistem
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      case "user_created":
        return (
          <div>
            <span className="font-medium">{user}</span> menambahkan pengguna
            baru <span className="font-medium">{data.newUser}</span>
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
      default:
        return (
          <div>
            <span className="font-medium">{user}</span>{" "}
            {activity.description || "melakukan aktivitas"}
            <div className="mt-1 text-xs text-muted-foreground">{time}</div>
          </div>
        );
    }
  }, []);

  // Handle empty state
  if (!loading && (!activities || activities.length === 0)) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        Belum ada aktivitas untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Activities list */}
      <ul className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type);

          return (
            <li key={activity.id || index} className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-1">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">{renderActivityContent(activity)}</div>
            </li>
          );
        })}
      </ul>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Memuat aktivitas...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mr-2 inline-block h-4 w-4" />
          Gagal memuat aktivitas: {error}
        </div>
      )}

      {/* Load more button */}
      {!loading && hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <button
            className="text-sm text-primary hover:underline focus:outline-none"
            onClick={onLoadMore}
          >
            Muat aktivitas lainnya
          </button>
        </div>
      )}
    </div>
  );
}
