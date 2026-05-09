export default function DareCard({ dare }: { dare: any }) {
  return (
    <div className="border p-4 rounded-lg shadow">
      <h3 className="text-xl font-bold">{dare.dare_text}</h3>
      <p>Bounty: {dare.bounty_lamports} lamports</p>
      <p>Status: {dare.status}</p>
    </div>
  );
}
