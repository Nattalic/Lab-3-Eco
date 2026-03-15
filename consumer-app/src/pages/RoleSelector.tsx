type RoleSelectorProps = {
  onGoToLogin: () => void;
  onGoToRegister: () => void;
};

export default function RoleSelector({
  onGoToLogin,
  onGoToRegister,
}: RoleSelectorProps) {
  const handleRoleRedirect = (role: string) => {
    if (role === 'consumer') {
      onGoToRegister();
    } else if (role === 'store') {
      window.location.href = 'http://localhost:5174';
    } else if (role === 'delivery') {
      window.location.href = 'http://localhost:5175';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-b from-orange-50 to-white">
      <div className="card w-full max-w-lg bg-white shadow-xl border border-orange-100">
        <div className="card-body">
          <h1 className="text-4xl font-bold text-center text-orange-500">
            Rappi Ecosystem
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Choose how you want to enter the platform
          </p>

          <div className="grid gap-3">
            <button
              className="btn btn-warning text-white"
              onClick={() => handleRoleRedirect('consumer')}
            >
              I am a Consumer
            </button>

            <button
              className="btn btn-outline border-orange-400 text-orange-500 hover:bg-orange-100"
              onClick={() => handleRoleRedirect('store')}
            >
              I am a Store
            </button>

            <button
              className="btn btn-outline border-orange-400 text-orange-500 hover:bg-orange-100"
              onClick={() => handleRoleRedirect('delivery')}
            >
              I am Delivery
            </button>
          </div>

          <div className="divider">or</div>

          <div className="flex flex-col gap-2">
            <button className="btn btn-neutral" onClick={onGoToLogin}>
              Go to Login
            </button>

            <button className="btn btn-ghost text-orange-500" onClick={onGoToRegister}>
              Go to Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}