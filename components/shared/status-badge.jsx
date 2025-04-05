// components/shared/status-badge.jsx
import { Badge } from "@/components/ui/badge";

const StatusBadge = ({ status, type = "pickup" }) => {
  // Default config (for pickup)
  let variant = "default";
  let label = status;
  
  if (type === "pickup") {
    switch (status) {
      case "PENDING":
        variant = "outline";
        label = "Pending";
        break;
      case "BERANGKAT":
        variant = "warning";
        label = "Berangkat";
        break;
      case "SELESAI":
        variant = "success";
        label = "Selesai";
        break;
      case "CANCELLED":
        variant = "destructive";
        label = "Dibatalkan";
        break;
      default:
        variant = "secondary";
    }
  } else if (type === "stt") {
    switch (status) {
      case "DRAFT":
        variant = "outline";
        label = "Draft";
        break;
      case "BARU":
        variant = "secondary";
        label = "Baru";
        break;
      case "DITERIMA_GUDANG":
        variant = "info";
        label = "Diterima Gudang";
        break;
      case "DALAM_PENGIRIMAN":
        variant = "warning";
        label = "Dalam Pengiriman";
        break;
      case "TERKIRIM":
        variant = "success";
        label = "Terkirim";
        break;
      case "CANCELLED":
        variant = "destructive";
        label = "Dibatalkan";
        break;
      default:
        variant = "secondary";
    }
  }
  
  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
