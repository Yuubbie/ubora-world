"use client";

export default function DeleteButton({ userId, deleteAction }: { userId: string, deleteAction: (formData: FormData) => void }) {
  return (
    <form action={deleteAction}>
      <input type="hidden" name="userId" value={userId} />
      <button 
        type="submit"
        onClick={(e) => {
          if (!window.confirm("Are you sure you want to permanently delete this user?")) {
            e.preventDefault();
          }
        }}
        className="text-red-600 hover:text-red-800 font-medium text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
      >
        Delete
      </button>
    </form>
  );
}