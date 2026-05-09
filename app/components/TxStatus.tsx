export default function TxStatus({ status, signature }: { status: string; signature?: string }) {
  return (
    <div className="p-4 border rounded bg-gray-50">
      <p>Status: <span className="font-bold">{status}</span></p>
      {signature && (
        <p>
          Signature:{' '}
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            className="text-blue-500 underline"
          >
            {signature.slice(0, 8)}...{signature.slice(-8)}
          </a>
        </p>
      )}
    </div>
  );
}
