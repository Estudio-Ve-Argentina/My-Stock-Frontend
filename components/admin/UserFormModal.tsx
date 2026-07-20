"use client";

import { useState } from "react";
import type { UserEntityResponse, UserSaveRequest } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TextField } from "@/components/ui/TextField";

interface UserFormModalProps {
  open: boolean;
  editingUser: UserEntityResponse | null;
  pending: boolean;
  error: string | null;
  onConfirm: (input: UserSaveRequest) => void;
  onCancel: () => void;
}

export function UserFormModal({
  open,
  editingUser,
  pending,
  error,
  onConfirm,
  onCancel,
}: UserFormModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(editingUser?.name ?? "");
  const [lastName, setLastName] = useState(editingUser?.lastName ?? "");
  const [username, setUsername] = useState(editingUser?.username ?? "");
  const [password, setPassword] = useState("");

  return (
    <ConfirmModal
      open={open}
      title={t(editingUser ? ui.admin.editUser : ui.admin.createUser)}
      confirmLabel={t(ui.common.save)}
      cancelLabel={t(ui.common.cancel)}
      onCancel={onCancel}
      onConfirm={() => onConfirm({ name, lastName, username, password })}
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={t(ui.admin.userFormName)}
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={t(ui.admin.userFormLastName)}
          name="lastName"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label={t(ui.admin.userFormUsername)}
          name="username"
          type="email"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label={t(ui.admin.userFormPassword)}
          name="password"
          type="password"
          required
          hint={editingUser ? t(ui.admin.userFormPasswordEditHint) : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}
        {pending && <p className="text-sm text-subtle">{t(ui.common.loading)}</p>}
      </div>
    </ConfirmModal>
  );
}
