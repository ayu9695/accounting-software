
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onSend?: () => void;
  customActions?: {
    label: string;
    onClick: () => void;
    className?: string;
  }[];
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onView,
  onEdit,
  onDelete,
  onDownload,
  onSend,
  customActions = []
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView}>View</DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        )}
        {onDownload && (
          <DropdownMenuItem onClick={onDownload}>Download PDF</DropdownMenuItem>
        )}
        {onSend && (
          <DropdownMenuItem onClick={onSend}>Send via Email</DropdownMenuItem>
        )}
        {customActions.map((action, index) => (
          <DropdownMenuItem 
            key={index} 
            onClick={action.onClick}
            className={action.className}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-destructive"
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
