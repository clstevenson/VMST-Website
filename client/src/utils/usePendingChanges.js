import { useState } from "react";

// generic tracker for unsaved edits in a table that batches writes behind a
// Save/Clear Changes pair of buttons (see UploadMembers and ManageUsers).
// Each pending change is keyed by an arbitrary string (eg `${id}:${field}`)
// and records the DB-persisted original value the first time that key is
// touched, so toggling back to it removes the entry again.
export default function usePendingChanges() {
  const [pendingChanges, setPendingChanges] = useState({});

  const setChange = (key, currentValue, newValue, meta = {}) => {
    setPendingChanges((prev) => {
      const original = prev[key]?.original ?? currentValue;
      if (newValue === original) {
        const rest = { ...prev };
        delete rest[key];
        return rest;
      }
      return { ...prev, [key]: { original, value: newValue, ...meta } };
    });
  };

  // drop pending entries matching a predicate, eg after a row is deleted
  const discard = (predicate) => {
    setPendingChanges((prev) => {
      const rest = {};
      for (const [key, entry] of Object.entries(prev)) {
        if (!predicate(entry, key)) rest[key] = entry;
      }
      return rest;
    });
  };

  const clearChanges = () => setPendingChanges({});
  const isChanged = (key) => key in pendingChanges;

  return { pendingChanges, setChange, discard, clearChanges, isChanged };
}
