import { User } from "../../prisma/generated/main/client";
import DeleteButton from "./DeleteButton";
import { getSession } from "../../lib/session";

interface UserTableProps {
  users: User[];
  errorMsg: string | null;
}

export default async function UserTable({ users, errorMsg }: UserTableProps) {
  const session = await getSession();
  if (errorMsg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="font-semibold">Database Query Failed</h3>
        <p className="text-xs mt-1 max-w-sm text-red-300/80">{errorMsg}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-700 rounded-xl text-slate-500">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="font-medium text-sm">No users found in the database.</p>
        <p className="text-xs mt-1 text-slate-600">Add your first user using the form.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-700/60 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <th className="pb-3 pr-4">User</th>
            <th className="pb-3 px-4">Role</th>
            <th className="pb-3 pl-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {users.map((user) => (
            <tr key={user.id} className="group hover:bg-slate-800/30 transition-colors">
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-100">{user.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 align-middle">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                      : "bg-slate-700/60 text-slate-400 border border-slate-600/40"
                  }`}
                >
                  {user.role}
                </span>
                {/* Delete button */}
              </td>
              <td className="py-4 pl-4 text-right align-middle">
                {session?.role === "ADMIN" && user.email!= 'yehiahassanain@gmail.com'? <DeleteButton id={user.id} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
