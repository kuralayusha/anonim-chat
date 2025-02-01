export default function ConnectionStatus({ status }: { status: string }) {
  return (
    <div className="p-2 bg-gray-200 rounded">
      <p className="text-sm">Status: {status}</p>
    </div>
  );
}
