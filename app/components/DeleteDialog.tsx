
import { Trash2Icon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"

interface DeleteTutionDialogProps {
    myTution: {
        _id: string
        title: string
    }
    onDelete: (id: string) => void
}

export function DeleteTutionDialog({
    myTution,
    onDelete,
}: DeleteTutionDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={
                    <Button variant="destructive" size="sm">
                        <Trash2Icon />
                        Delete
                    </Button>
                }
            />

            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>

                    <AlertDialogTitle>
                        Delete Tuition?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{myTution.title}</strong>?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => onDelete(myTution._id)}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
