export default function SuccessPage() {
  return (
    <div className="min-h-screen w-full bg-black text-white flex items-start">
      <div className="max-w-2xl mx-auto p-4 sm:p-8 w-full">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-lg">
          <div className="h-2 bg-red-600" />
          <div className="p-6 sm:p-8 space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Thank you</h1>
            <p className="text-white/90 text-lg">
              thanks for sumbitting the form, you are one step closer to acheiving your dreams keep it up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

