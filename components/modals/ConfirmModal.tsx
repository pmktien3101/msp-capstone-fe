import { Dialog, DialogHeader, DialogFooter, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    content?: string;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean; // màu đỏ, nếu true
}

export const ConfirmModal = ({
    open,
    title = "Bạn chắc chắn?",
    content = "",
    loading = false,
    onCancel,
    onConfirm,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    destructive = false,
}: ConfirmModalProps) => (
    <Dialog open={open} onOpenChange={onCancel}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {content && <p className="text-sm text-muted-foreground mb-4">{content}</p>}
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel} disabled={loading}>
                    {cancelText}
                </Button>
                <Button
                    variant={destructive ? "destructive" : "default"}
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {confirmText}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
