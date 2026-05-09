import ProofForm from "@/components/ProofForm";

export default function ProveDarePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Submit Proof for Dare #{params.id}</h1>
      <ProofForm dareId={params.id} />
    </div>
  );
}
