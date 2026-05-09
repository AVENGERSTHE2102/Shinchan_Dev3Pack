export default function DarePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Dare #{params.id}</h1>
      <p>Dare details will go here.</p>
    </div>
  );
}
