"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TableActions({ actions, row, rowIndex }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);

  // Handle action click
  const handleActionClick = (action) => {
    if (action.requireConfirmation) {
      setCurrentAction(action);
      setConfirmOpen(true);
    } else {
      action.onClick(row, rowIndex);
    }
  };

  // Confirm action
  const confirmAction = () => {
    if (currentAction) {
      currentAction.onClick(row, rowIndex);
      setConfirmOpen(false);
      setCurrentAction(null);
    }
  };

  // Render inline actions (visible directly in the table)
  const renderInlineActions = () => {
    const inlineActions = actions.filter(action => action.inline !== false);
    
    if (inlineActions.length === 0) return null;
    
    return (
      <div className="flex items-center gap-2 justify-end">
        {inlineActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size="sm"
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            className={cn("text-sm", action.className)}
          >
            {action.loading ? (
              <AlarmClock className="h-4 w-4 animate-spin" />
            ) : action.icon ? (
              <action.icon className="h-4 w-4" />
            ) : null}
            {action.showLabel && action.label && (
              <span className={action.icon ? "ml-2" : ""}>{action.label}</span>
            )}
            {!action.showLabel && (
              <span className="sr-only">{action.label}</span>
            )}
          </Button>
        ))}
      </div>
    );
  };

  // Render dropdown menu actions
  const renderDropdownActions = () => {
    const dropdownActions = actions.filter(action => action.dropdown !== false);
    
    if (dropdownActions.length === 0) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dropdownActions.map((action, index) => (
            <div key={index}>
              {action.separator && index > 0 && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={cn(
                  action.destructive && "text-destructive",
                  action.className
                )}
              >
                {action.icon && (
                  <action.icon className="mr-2 h-4 w-4" />
                )}
                {action.label}
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render the confirmation dialog
  const renderConfirmationDialog = () => {
    if (!currentAction) return null;
    
    return (
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentAction.confirmTitle || "Konfirmasi"}</DialogTitle>
            <DialogDescription>
              {currentAction.confirmDescription || "Apakah Anda yakin ingin melakukan tindakan ini?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant={currentAction.confirmButtonVariant || (currentAction.destructive ? "destructive" : "default")}
              onClick={confirmAction}
            >
              {currentAction.confirmButtonText || "Konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {renderInlineActions()}
        {renderDropdownActions()}
      </div>
      {renderConfirmationDialog()}
    </>
  );
}