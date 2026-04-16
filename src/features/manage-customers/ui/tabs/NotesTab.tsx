import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pin, PinOff, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { formatDateTime, cn } from '@/shared/lib/utils'
import { customersRepository } from '@/features/manage-customers/api/customersRepository'
import type { CustomerAdminNote } from '@/entities/customer'

interface Props {
  userId: string
  notes: CustomerAdminNote[]
  currentAdminId: string
}

/** Query keys centralizados para poder invalidar desde cualquier mutation. */
const queryKey = (userId: string) => ['admin', 'customer', userId, 'overview'] as const

export function NotesTab({ userId, notes, currentAdminId }: Props) {
  const [draft, setDraft] = useState('')
  const [draftPinned, setDraftPinned] = useState(false)
  const qc = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (vars: { body: string; pinned: boolean }) =>
      customersRepository.createNote(userId, vars.body, vars.pinned),
    onSuccess: () => {
      setDraft('')
      setDraftPinned(false)
      toast.success('Nota creada')
      qc.invalidateQueries({ queryKey: queryKey(userId) })
    },
    onError: (err: unknown) => {
      toast.error(extractMessage(err, 'No se pudo crear la nota'))
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Nueva nota interna… (visible sólo para admins, máximo 4000 caracteres)"
            value={draft}
            maxLength={4000}
            rows={3}
            onChange={e => setDraft(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="pin-note"
                checked={draftPinned}
                onCheckedChange={(v) => setDraftPinned(v === true)}
              />
              <Label htmlFor="pin-note" className="text-sm text-muted-foreground cursor-pointer font-normal">
                Fijar al tope
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{draft.length} / 4000</span>
              <Button
                size="sm"
                disabled={!draft.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate({ body: draft.trim(), pinned: draftPinned })}
              >
                {createMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Publicar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Aún no hay notas internas para este cliente.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              userId={userId}
              canEdit={note.authorId === currentAdminId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note,
  userId,
  canEdit,
}: {
  note: CustomerAdminNote
  userId: string
  canEdit: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(note.body)
  const qc = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (patch: { body?: string; pinned?: boolean }) =>
      customersRepository.updateNote(note.id, patch),
    onSuccess: () => {
      setIsEditing(false)
      toast.success('Nota actualizada')
      qc.invalidateQueries({ queryKey: queryKey(userId) })
    },
    onError: (err: unknown) => {
      toast.error(extractMessage(err, 'No se pudo actualizar la nota'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => customersRepository.deleteNote(note.id),
    onSuccess: () => {
      toast.success('Nota eliminada')
      qc.invalidateQueries({ queryKey: queryKey(userId) })
    },
    onError: (err: unknown) => {
      toast.error(extractMessage(err, 'No se pudo eliminar la nota'))
    },
  })

  return (
    <Card className={cn(note.pinned && 'border-primary/50 bg-primary/5')}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {note.pinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="h-3 w-3" />
                Fijada
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDateTime(note.createdAt)}
              {note.updatedAt !== note.createdAt && (
                <> · editada {formatDateTime(note.updatedAt)}</>
              )}
            </span>
            {!note.authorId && (
              <Badge variant="outline" className="text-xs">autor eliminado</Badge>
            )}
          </div>
          {canEdit && !isEditing && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                title={note.pinned ? 'Desfijar' : 'Fijar al tope'}
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ pinned: !note.pinned })}
              >
                {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Editar"
                onClick={() => {
                  setDraft(note.body)
                  setIsEditing(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Eliminar"
                className="hover:text-destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (confirm('¿Eliminar esta nota? Esta acción queda registrada en el audit log.')) {
                    deleteMutation.mutate()
                  }
                }}
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              maxLength={4000}
              rows={3}
              onChange={e => setDraft(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                <X className="h-3 w-3 mr-1" /> Cancelar
              </Button>
              <Button
                size="sm"
                disabled={!draft.trim() || draft === note.body || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ body: draft.trim() })}
              >
                {updateMutation.isPending
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <><Save className="h-3 w-3 mr-1" /> Guardar</>}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{note.body}</p>
        )}
      </CardContent>
    </Card>
  )
}

function extractMessage(err: unknown, fallback: string): string {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string }
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback
}
